package org.example.khoahoc.controller;

import lombok.RequiredArgsConstructor;
import org.example.khoahoc.dto.response.ApiResponse;
import org.example.khoahoc.entity.Lesson;
import org.example.khoahoc.entity.User;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.repository.LessonRepository;
import org.example.khoahoc.repository.UserRepository;
import org.example.khoahoc.service.VideoService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @PostMapping("/upload/{lessonId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<String>> uploadVideo(
            @PathVariable Long lessonId,
            @RequestParam("file") MultipartFile file) {
        
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new AppException(ErrorCode.LESSON_NOT_FOUND));

        String objectPath = videoService.uploadVideoToMinio(lesson, file);

        lesson.setVideoUrl(objectPath);
        lessonRepository.save(lesson);

        ApiResponse<String> response = new ApiResponse<>();
        response.setCode(ErrorCode.SUCCESS.getCode());
        response.setMessage("Tải lên video thành công.");
        response.setResult(objectPath);
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{lessonId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteVideo(@PathVariable Long lessonId) {
        videoService.deleteLessonVideo(lessonId);

        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(ErrorCode.SUCCESS.getCode());
        response.setMessage("Xóa video bài học thành công.");
        return ResponseEntity.ok(response);
    }

    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getUserId();
    }
}
