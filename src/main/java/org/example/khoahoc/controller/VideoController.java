package org.example.khoahoc.controller;

import lombok.RequiredArgsConstructor;
import org.example.khoahoc.entity.User;
import org.example.khoahoc.entity.Lesson;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.repository.LessonRepository;
import org.example.khoahoc.repository.UserRepository;
import org.example.khoahoc.service.VideoService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;

    /**
     * Endpoint để lấy link Signed URL cho video MP4 đơn lẻ.
     */
    @GetMapping("/signed-url/{lessonId}")
    public ResponseEntity<String> getSignedUrl(@PathVariable Long lessonId) {
        Long userId = getCurrentUserId();
        String signedUrl = videoService.getSignedUrl(lessonId, userId);
        return ResponseEntity.ok(signedUrl);
    }

    /**
     * Endpoint phục vụ playlist HLS đã được ký tên (Proxy).
     * Trình phát video (hls.js) sẽ gọi vào đây.
     */
    @GetMapping(value = "/stream/{lessonId}/playlist.m3u8", produces = "application/x-mpegURL")
    public ResponseEntity<String> getHlsPlaylist(@PathVariable Long lessonId) {
        Long userId = getCurrentUserId();
        String playlistContent = videoService.getProxyHlsPlaylist(lessonId, userId);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/x-mpegURL")
                // Quan trọng: Chặn cache để URL luôn mới
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .body(playlistContent);
    }

    /**
     * Endpoint để giảng viên upload video MP4.
     * Hệ thống sẽ tự động convert sang HLS và lưu vào MinIO.
     */
    @PostMapping(value = "/upload/{lessonId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadVideo(
            @PathVariable Long lessonId,
            @RequestParam("file") MultipartFile file) {
        
        // 1. Kiểm tra bài học có tồn tại không TRƯỚC khi xử lý video (Tiết kiệm tài nguyên)
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new AppException(ErrorCode.LESSON_NOT_FOUND));

        // 2. Chạy tiến trình cắt video và upload lên MinIO
        String videoUrl = videoService.processAndUploadVideo(file, lessonId.toString());
        
        // 3. Cập nhật đường dẫn m3u8 vào Database cho bài học
        lesson.setVideoUrl(videoUrl);
        lessonRepository.save(lesson);
        
        return ResponseEntity.ok("Video đã được xử lý và lưu tại: " + videoUrl);
    }

    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getUserId();
    }
}
