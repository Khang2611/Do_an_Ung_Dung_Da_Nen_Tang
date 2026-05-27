package org.example.khoahoc.service;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.GetObjectArgs;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.entity.Chapter;
import org.example.khoahoc.entity.Lesson;
import org.example.khoahoc.entity.User;
import org.example.khoahoc.enums.Role;
import org.example.khoahoc.repository.ChapterRepository;
import org.example.khoahoc.repository.EnrollmentRepository;
import org.example.khoahoc.repository.LessonRepository;
import org.example.khoahoc.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoService {

    private final MinioClient minioClient;
    private final LessonRepository lessonRepository;
    private final ChapterRepository chapterRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;

    @Value("${minio.public-endpoint:http://localhost:9000}")
    private String publicEndpoint;

    /**
     * Layer 1 & 2: Kiểm tra enrollment và tạo Signed URL cho file MP4 đơn lẻ.
     */
    public String getSignedUrl(Long lessonId, Long userId) {
        validateEnrollment(lessonId, userId);

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        try {
            return publicMinioClient().getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucketName)
                            .object(lesson.getVideoUrl())
                            .expiry(15, TimeUnit.MINUTES)
                            .build()
            );
        } catch (Exception e) {
            log.error("Error generating presigned URL", e);
            throw new RuntimeException("Could not generate video link");
        }
    }

    /**
     * Layer 3: HLS Streaming với Proxy Playlist.
     * Kỹ thuật này ký tên cho từng mảnh (.ts) trong playlist.
     */
    public String getProxyHlsPlaylist(Long lessonId, Long userId) {
        validateEnrollment(lessonId, userId);

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        String videoPath = lesson.getVideoUrl(); // Giả định là path/to/playlist.m3u8
        if (!videoPath.endsWith(".m3u8")) {
            throw new RuntimeException("Lesson video is not in HLS format");
        }

        try (InputStream stream = minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(bucketName)
                        .object(videoPath)
                        .build())) {
            
            BufferedReader reader = new BufferedReader(new InputStreamReader(stream));
            String baseDir = videoPath.substring(0, videoPath.lastIndexOf("/") + 1);

            return reader.lines().map(line -> {
                if (line.endsWith(".ts")) {
                    // Ký tên cho từng segment
                    return getSignedUrlForObject(baseDir + line, 30); // Segment hết hạn sau 30 phút
                }
                if (line.contains("URI=\"")) {
                    // Nếu có key mã hóa AES-128 trong dòng #EXT-X-KEY thì ký lại URL key.
                    int uriStart = line.indexOf("URI=\"") + 5;
                    int uriEnd = line.indexOf("\"", uriStart);
                    if (uriEnd > uriStart) {
                        String keyFile = line.substring(uriStart, uriEnd);
                        String signedKeyUrl = getSignedUrlForObject(baseDir + keyFile, 15);
                        return line.substring(0, uriStart) + signedKeyUrl + line.substring(uriEnd);
                    }
                }
                return line;
            }).collect(Collectors.joining("\n"));

        } catch (Exception e) {
            log.error("Error processing HLS playlist", e);
            throw new RuntimeException("Could not process video stream");
        }
    }

    private String getSignedUrlForObject(String objectName, int expiryMinutes) {
        try {
            return publicMinioClient().getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucketName)
                            .object(objectName)
                            .expiry(expiryMinutes, TimeUnit.MINUTES)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Error signing object: " + objectName);
        }
    }

    private MinioClient publicMinioClient() {
        return MinioClient.builder()
                .endpoint(publicEndpoint)
                .credentials(accessKey, secretKey)
                .region("us-east-1")
                .build();
    }

    private void validateEnrollment(Long lessonId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() == Role.ADMIN || user.getRole() == Role.TEACHER) {
            return;
        }

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        
        Chapter chapter = chapterRepository.findById(lesson.getChapterId())
                .orElseThrow(() -> new RuntimeException("Chapter not found"));

        enrollmentRepository.findByUserIdAndCourseIdAndStatus(userId, chapter.getCourseId(), "ACTIVE")
                .orElseThrow(() -> new RuntimeException("You are not enrolled in this course or enrollment is inactive"));
    }

    /**
     * Tải file video MP4 lên MinIO Private Bucket.
     */
    public String uploadVideoToMinio(Lesson lesson, MultipartFile file) {
        String objectPath = "courses/lesson-" + lesson.getLessonId() + ".mp4";
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectPath)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType("video/mp4")
                            .build()
            );
            return objectPath;
        } catch (Exception e) {
            log.error("Lỗi khi đẩy video lên MinIO", e);
            throw new RuntimeException("Không thể lưu trữ file video vào MinIO");
        }
    }

    public void deleteLessonVideo(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        String objectPath = lesson.getVideoUrl();
        if (objectPath != null && !objectPath.isBlank()) {
            try {
                minioClient.removeObject(
                        RemoveObjectArgs.builder()
                                .bucket(bucketName)
                                .object(objectPath)
                                .build()
                );
            } catch (Exception e) {
                log.warn("Khong the xoa object video khoi MinIO: {}", objectPath, e);
            }
        }

        lesson.setVideoUrl(null);
        lessonRepository.save(lesson);
    }
}
