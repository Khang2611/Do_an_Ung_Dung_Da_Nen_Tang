package org.example.khoahoc.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.entity.User;
import org.example.khoahoc.entity.Lesson;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.repository.LessonRepository;
import org.example.khoahoc.repository.UserRepository;
import org.example.khoahoc.service.VideoService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * VideoController — API quản lý và phát video bảo mật.
 *
 * Security Headers được thêm vào mọi response liên quan đến video:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  X-Content-Type-Options: nosniff       → Chặn MIME type sniffing      │
 * │  X-Frame-Options: DENY                 → Chặn nhúng iframe            │
 * │  Content-Security-Policy: frame-ancestors 'none' → Chặn embed        │
 * │  X-XSS-Protection: 1; mode=block       → Chặn XSS                    │
 * │  Referrer-Policy: no-referrer           → Không leak referrer          │
 * │  Cache-Control: no-cache, no-store      → Chặn cache hoàn toàn        │
 * │  Pragma: no-cache                       → Tương thích HTTP/1.0         │
 * │  Permissions-Policy: ...                → Chặn camera/mic/autoplay     │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
@Slf4j
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
        log.info("User {} yêu cầu Signed URL cho lesson {}", userId, lessonId);

        String signedUrl = videoService.getSignedUrl(lessonId, userId);

        return ResponseEntity.ok()
                .headers(buildSecurityHeaders())
                .body(signedUrl);
    }

    /**
     * Endpoint phục vụ playlist HLS đã được ký tên (Proxy).
     * Trình phát video (hls.js) sẽ gọi vào đây.
     *
     * Security: Response được bảo vệ bởi nhiều lớp header để chặn
     * việc cache, nhúng iframe, hoặc tải lại nội dung.
     */
    @GetMapping(value = "/stream/{lessonId}/playlist.m3u8", produces = "application/x-mpegURL")
    public ResponseEntity<String> getHlsPlaylist(@PathVariable Long lessonId) {
        Long userId = getCurrentUserId();
        log.info("User {} yêu cầu HLS playlist cho lesson {}", userId, lessonId);

        String playlistContent = videoService.getProxyHlsPlaylist(lessonId, userId);

        HttpHeaders headers = buildSecurityHeaders();
        headers.set(HttpHeaders.CONTENT_TYPE, "application/x-mpegURL");

        return ResponseEntity.ok()
                .headers(headers)
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
        
        log.info("Upload video thành công cho lesson {} tại {}", lessonId, videoUrl);
        return ResponseEntity.ok("Video đã được xử lý và lưu tại: " + videoUrl);
    }

    // ─── Security Helpers ────────────────────────────────────────────────────

    /**
     * Tạo bộ Security Headers chuyên nghiệp cho mọi video response.
     * Mỗi header có mục đích chống lại một vector tấn công cụ thể.
     */
    private HttpHeaders buildSecurityHeaders() {
        HttpHeaders headers = new HttpHeaders();

        // ── Chặn cache hoàn toàn → URL luôn phải lấy mới ──
        headers.set(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate, private, max-age=0");
        headers.set(HttpHeaders.PRAGMA, "no-cache");
        headers.set(HttpHeaders.EXPIRES, "0");

        // ── Chặn MIME type sniffing → ngăn trình duyệt tự đoán Content-Type ──
        headers.set("X-Content-Type-Options", "nosniff");

        // ── Chặn nhúng trong iframe → ngăn clickjacking & embed trái phép ──
        headers.set("X-Frame-Options", "DENY");
        headers.set("Content-Security-Policy",
                "frame-ancestors 'none'; " +
                "default-src 'self'; " +
                "media-src 'self' blob: data:; " +
                "script-src 'self'"
        );

        // ── Chặn XSS ──
        headers.set("X-XSS-Protection", "1; mode=block");

        // ── Không leak Referrer URL ra ngoài ──
        headers.set("Referrer-Policy", "no-referrer");

        // ── Permissions Policy → hạn chế các API nguy hiểm ──
        // Chặn camera, microphone, picture-in-picture, screen capture từ iframe
        headers.set("Permissions-Policy",
                "camera=(), microphone=(), display-capture=(), " +
                "picture-in-picture=(self), fullscreen=(self)"
        );

        // ── Cross-Origin headers → chặn truy cập từ domain khác ──
        headers.set("Cross-Origin-Resource-Policy", "same-origin");
        headers.set("Cross-Origin-Opener-Policy", "same-origin");

        return headers;
    }

    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getUserId();
    }
}
