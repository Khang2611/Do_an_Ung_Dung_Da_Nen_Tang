package org.example.khoahoc.service;

import io.minio.GetObjectArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.ListObjectsArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.Result;
import io.minio.http.Method;
import io.minio.messages.Item;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.entity.Chapter;
import org.example.khoahoc.entity.Lesson;
import org.example.khoahoc.entity.User;
import org.example.khoahoc.entity.VideoEncryptionKey;
import org.example.khoahoc.enums.Role;
import org.example.khoahoc.repository.ChapterRepository;
import org.example.khoahoc.repository.EnrollmentRepository;
import org.example.khoahoc.repository.LessonRepository;
import org.example.khoahoc.repository.UserRepository;
import org.example.khoahoc.repository.VideoEncryptionKeyRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoService {

    private final MinioClient minioClient;
    private final LessonRepository lessonRepository;
    private final ChapterRepository chapterRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final VideoEncryptionKeyRepository videoEncryptionKeyRepository;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;

    @Value("${minio.public-endpoint:http://localhost:9000}")
    private String publicEndpoint;

    @Value("${video.ffmpeg.path:ffmpeg}")
    private String ffmpegPath;

    @Value("${video.hls.segment-duration-seconds:10}")
    private int hlsSegmentDurationSeconds;

    /**
     * Layer 1 & 2: Check enrollment and create a signed URL for a raw MP4 object.
     */
    public String getSignedUrl(Long lessonId, Long userId) {
        validateEnrollment(lessonId, userId);

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        if (lesson.getVideoUrl() == null || lesson.getVideoUrl().isBlank()) {
            throw new RuntimeException("Lesson does not have a video");
        }

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
     * Layer 3: HLS streaming with a proxy playlist.
     * The playlist is private in MinIO; this method signs every segment and key URL.
     */
    public String getProxyHlsPlaylist(Long lessonId, Long userId) {
        validateEnrollment(lessonId, userId);

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        String videoPath = lesson.getVideoUrl();
        if (videoPath == null || !videoPath.endsWith(".m3u8")) {
            throw new RuntimeException("Lesson video is not in HLS format");
        }

        try (InputStream stream = minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(bucketName)
                        .object(videoPath)
                        .build())) {

            BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8));
            String baseDir = videoPath.substring(0, videoPath.lastIndexOf("/") + 1);

            return reader.lines().map(line -> {
                if (line.endsWith(".ts")) {
                    return getSignedUrlForObject(baseDir + line, 30);
                }
                if (line.contains("URI=\"")) {
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
     * Convert an uploaded MP4 into AES-128 encrypted HLS and upload all artifacts to MinIO.
     */
    public String uploadVideoToMinio(Lesson lesson, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Video file is empty");
        }
        if (!isMp4File(file)) {
            throw new RuntimeException("Only MP4 video files are supported");
        }

        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("lms_video_");
            Path sourceFile = tempDir.resolve("input.mp4");
            Path outputDir = Files.createDirectories(tempDir.resolve("hls_output"));

            file.transferTo(sourceFile.toFile());
            log.info("Saved temporary MP4 file: {} ({} bytes)", sourceFile, Files.size(sourceFile));

            byte[] aesKey = new byte[16];
            byte[] iv = new byte[16];
            SecureRandom secureRandom = new SecureRandom();
            secureRandom.nextBytes(aesKey);
            secureRandom.nextBytes(iv);

            Path keyFile = outputDir.resolve("encryption.key");
            Path keyInfoFile = outputDir.resolve("keyinfo.txt");
            Files.write(keyFile, aesKey);
            Files.writeString(
                    keyInfoFile,
                    String.join(System.lineSeparator(),
                            "encryption.key",
                            keyFile.toAbsolutePath().toString(),
                            HexFormat.of().formatHex(iv)
                    ) + System.lineSeparator(),
                    StandardCharsets.UTF_8
            );

            runFfmpeg(sourceFile, outputDir, keyInfoFile);

            String basePath = "lesson_" + lesson.getLessonId();
            String playlistObjectPath = basePath + "/playlist.m3u8";

            uploadPath(outputDir.resolve("playlist.m3u8"), playlistObjectPath, "application/x-mpegURL");
            uploadSegments(outputDir, basePath);
            uploadPath(keyFile, basePath + "/encryption.key", "application/octet-stream");
            saveEncryptionKey(lesson.getLessonId(), aesKey, iv);

            log.info("Uploaded encrypted HLS video for lesson {} to {}", lesson.getLessonId(), playlistObjectPath);
            return playlistObjectPath;
        } catch (RuntimeException e) {
            throw e;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Video processing was interrupted", e);
            throw new RuntimeException("Video processing was interrupted", e);
        } catch (Exception e) {
            log.error("Error processing and uploading encrypted HLS video", e);
            throw new RuntimeException("Could not process and store encrypted video");
        } finally {
            cleanupTempDirectory(tempDir);
        }
    }

    private boolean isMp4File(MultipartFile file) {
        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        return "video/mp4".equalsIgnoreCase(contentType)
                || (originalFilename != null && originalFilename.toLowerCase(Locale.ROOT).endsWith(".mp4"));
    }

    private void runFfmpeg(Path sourceFile, Path outputDir, Path keyInfoFile) throws IOException, InterruptedException {
        List<String> command = List.of(
                ffmpegPath,
                "-y",
                "-i", sourceFile.toString(),
                "-c:v", "libx264",
                "-preset", "medium",
                "-b:v", "2500k",
                "-c:a", "aac",
                "-b:a", "128k",
                "-hls_time", String.valueOf(hlsSegmentDurationSeconds),
                "-hls_list_size", "0",
                "-hls_key_info_file", keyInfoFile.toString(),
                "-hls_playlist_type", "vod",
                "-hls_segment_filename", outputDir.resolve("segment_%05d.ts").toString(),
                outputDir.resolve("playlist.m3u8").toString()
        );

        log.info("Running FFmpeg command: {}", String.join(" ", command));
        Process process = new ProcessBuilder(command)
                .redirectErrorStream(true)
                .start();

        String ffmpegOutput;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
            ffmpegOutput = reader.lines().collect(Collectors.joining(System.lineSeparator()));
        }

        int exitCode;
        try {
            exitCode = process.waitFor();
        } catch (InterruptedException e) {
            process.destroyForcibly();
            throw e;
        }
        if (exitCode != 0) {
            log.error("FFmpeg failed with exit code {}. Output: {}", exitCode, ffmpegOutput);
            throw new RuntimeException("FFmpeg could not process the uploaded video");
        }
        log.debug("FFmpeg output: {}", ffmpegOutput);
    }

    private void uploadSegments(Path outputDir, String basePath) throws IOException {
        try (Stream<Path> files = Files.list(outputDir)) {
            List<Path> segments = files
                    .filter(path -> path.getFileName().toString().endsWith(".ts"))
                    .sorted()
                    .toList();

            if (segments.isEmpty()) {
                throw new RuntimeException("FFmpeg did not generate HLS segments");
            }

            for (Path segment : segments) {
                uploadPath(segment, basePath + "/" + segment.getFileName(), "video/mp2t");
            }
        }
    }

    private void uploadPath(Path sourcePath, String objectPath, String contentType) throws IOException {
        try (InputStream inputStream = Files.newInputStream(sourcePath)) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectPath)
                            .stream(inputStream, Files.size(sourcePath), -1)
                            .contentType(contentType)
                            .build()
            );
        } catch (Exception e) {
            throw new RuntimeException("Could not upload object to MinIO: " + objectPath, e);
        }
    }

    private void saveEncryptionKey(Long lessonId, byte[] aesKey, byte[] iv) {
        VideoEncryptionKey keyRecord = videoEncryptionKeyRepository.findByLessonId(lessonId)
                .orElseGet(VideoEncryptionKey::new);
        keyRecord.setLessonId(lessonId);
        keyRecord.setEncryptionMethod("AES-128");
        keyRecord.setEncryptedKey(Base64.getEncoder().encodeToString(aesKey));
        keyRecord.setIv(Base64.getEncoder().encodeToString(iv));
        keyRecord.setCreatedAt(LocalDateTime.now());
        videoEncryptionKeyRepository.save(keyRecord);
    }

    private void cleanupTempDirectory(Path tempDir) {
        if (tempDir == null || !Files.exists(tempDir)) {
            return;
        }

        try (Stream<Path> paths = Files.walk(tempDir)) {
            paths.sorted(Comparator.reverseOrder()).forEach(path -> {
                try {
                    Files.deleteIfExists(path);
                } catch (IOException e) {
                    log.warn("Could not delete temporary file: {}", path, e);
                }
            });
        } catch (IOException e) {
            log.warn("Could not clean temporary video directory: {}", tempDir, e);
        }
    }

    public void deleteLessonVideo(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        String objectPath = lesson.getVideoUrl();
        if (objectPath != null && !objectPath.isBlank()) {
            try {
                if (objectPath.endsWith(".m3u8") && objectPath.contains("/")) {
                    deleteObjectPrefix(objectPath.substring(0, objectPath.lastIndexOf("/") + 1));
                } else {
                    deleteObject(objectPath);
                }
            } catch (Exception e) {
                log.warn("Khong the xoa object video khoi MinIO: {}", objectPath, e);
            }
        }

        lesson.setVideoUrl(null);
        lessonRepository.save(lesson);
    }

    private void deleteObjectPrefix(String prefix) throws Exception {
        Iterable<Result<Item>> objects = minioClient.listObjects(
                ListObjectsArgs.builder()
                        .bucket(bucketName)
                        .prefix(prefix)
                        .recursive(true)
                        .build()
        );

        for (Result<Item> result : objects) {
            deleteObject(result.get().objectName());
        }
    }

    private void deleteObject(String objectPath) throws Exception {
        minioClient.removeObject(
                RemoveObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectPath)
                        .build()
        );
    }
}
