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

import io.minio.PutObjectArgs;
import org.springframework.web.multipart.MultipartFile;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
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
     * Kỹ thuật ký tên cho từng mảnh (.ts) trong playlist.
     */
    public String getProxyHlsPlaylist(Long lessonId, Long userId) {
        validateEnrollment(lessonId, userId);

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        String videoPath = lesson.getVideoUrl();
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

    /**
     * Tự động chia nhỏ video MP4 thành HLS và upload lên MinIO.
     */
    public String processAndUploadVideo(MultipartFile mp4File, String lessonId) {
        String tempDir = System.getProperty("java.io.tmpdir") + File.separator + "lms_video_" + UUID.randomUUID();
        File directory = new File(tempDir);
        if (!directory.mkdirs()) {
            log.warn("Thư mục tạm đã tồn tại hoặc không thể tạo: {}", tempDir);
        }

        try {
            // 1. Lưu file MP4 tạm thời
            File sourceFile = new File(tempDir + File.separator + "input.mp4");
            mp4File.transferTo(sourceFile);
            log.info("Đã lưu file MP4 tạm thời tại: {}", sourceFile.getAbsolutePath());

            // 2. Chạy lệnh FFmpeg ở chế độ COPY (Siêu tốc độ - Tự động ghi đè bằng -y)
            String m3u8Name = "playlist.m3u8";
            ProcessBuilder pb = new ProcessBuilder(
                    "ffmpeg", "-y", // Tự động đồng ý ghi đè, không dừng lại hỏi
                    "-i", sourceFile.getAbsolutePath(),
                    "-c", "copy",
                    "-hls_time", "10",
                    "-hls_list_size", "0", 
                    "-f", "hls",
                    tempDir + File.separator + m3u8Name
            );
            
            // QUAN TRỌNG: Phải có dòng này để in log của FFmpeg ra màn hình
            // Nếu không, bộ đệm (buffer) bị đầy và FFmpeg sẽ bị treo (hang) vĩnh viễn!
            pb.inheritIO();
            
            log.info("Bắt đầu quá trình FFmpeg...");
            Process process = pb.start();
            int exitCode = process.waitFor();
            
            if (exitCode != 0) {
                throw new RuntimeException("FFmpeg kết thúc với lỗi (exit code: " + exitCode + ")");
            }
            log.info("FFmpeg hoàn tất thành công.");

            // 3. Upload tất cả file (.m3u8 và .ts) lên MinIO
            File[] files = directory.listFiles();
            String minioFolderPath = "lessons/" + lessonId + "/";
            
            if (files != null) {
                for (File file : files) {
                    if (file.getName().endsWith(".m3u8") || file.getName().endsWith(".ts")) {
                        try (InputStream is = Files.newInputStream(file.toPath())) {
                            minioClient.putObject(
                                    PutObjectArgs.builder()
                                            .bucket(bucketName)
                                            .object(minioFolderPath + file.getName())
                                            .stream(is, file.length(), -1)
                                            .contentType(file.getName().endsWith(".m3u8") ? "application/x-mpegURL" : "video/MP2T")
                                            .build()
                            );
                        }
                    }
                }
            }

            log.info("Đã upload toàn bộ file HLS lên MinIO tại: {}", minioFolderPath);
            return minioFolderPath + m3u8Name;

        } catch (Exception e) {
            log.error("Lỗi trong quá trình xử lý và upload video", e);
            throw new RuntimeException("Lỗi hệ thống khi xử lý video: " + e.getMessage());
        } finally {
            // Xóa thư mục tạm để giải phóng bộ nhớ
            deleteDirectory(directory);
        }
    }

    private void deleteDirectory(File directoryToBeDeleted) {
        File[] allContents = directoryToBeDeleted.listFiles();
        if (allContents != null) {
            for (File file : allContents) {
                deleteDirectory(file);
            }
        }
        directoryToBeDeleted.delete();
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
