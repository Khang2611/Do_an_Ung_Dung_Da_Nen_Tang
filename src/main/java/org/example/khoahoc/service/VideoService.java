package org.example.khoahoc.service;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.GetObjectArgs;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.entity.Chapter;
import org.example.khoahoc.entity.Lesson;
import org.example.khoahoc.repository.ChapterRepository;
import org.example.khoahoc.repository.EnrollmentRepository;
import org.example.khoahoc.repository.LessonRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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

    @Value("${minio.bucket-name}")
    private String bucketName;

    /**
     * Layer 1 & 2: Kiểm tra enrollment và tạo Signed URL cho file MP4 đơn lẻ.
     */
    public String getSignedUrl(Long lessonId, Long userId) {
        validateEnrollment(lessonId, userId);

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        try {
            return minioClient.getPresignedObjectUrl(
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
                if (line.startsWith("URI=\"")) {
                    // Nếu có key mã hóa (DRM Layer 4 - AES-128)
                    String keyFile = line.substring(line.indexOf("\"") + 1, line.lastIndexOf("\""));
                    return "URI=\"" + getSignedUrlForObject(baseDir + keyFile, 15) + "\"";
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
            return minioClient.getPresignedObjectUrl(
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

    private void validateEnrollment(Long lessonId, Long userId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        
        Chapter chapter = chapterRepository.findById(lesson.getChapterId())
                .orElseThrow(() -> new RuntimeException("Chapter not found"));

        enrollmentRepository.findByUserIdAndCourseIdAndStatus(userId, chapter.getCourseId(), "ACTIVE")
                .orElseThrow(() -> new RuntimeException("You are not enrolled in this course or enrollment is inactive"));
    }
}
