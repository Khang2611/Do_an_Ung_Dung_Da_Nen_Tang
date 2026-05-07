package org.example.khoahoc.controller;

import lombok.RequiredArgsConstructor;
import org.example.khoahoc.entity.User;
import org.example.khoahoc.repository.UserRepository;
import org.example.khoahoc.service.VideoService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;
    private final UserRepository userRepository;

    /**
     * Endpoint Ä‘á»ƒ láº¥y link Signed URL cho video MP4 Ä‘Æ¡n láº».
     */
    @GetMapping("/signed-url/{lessonId}")
    public ResponseEntity<String> getSignedUrl(@PathVariable Long lessonId) {
        Long userId = getCurrentUserId();
        String signedUrl = videoService.getSignedUrl(lessonId, userId);
        return ResponseEntity.ok(signedUrl);
    }

    /**
     * Endpoint phá»¥c vá»¥ playlist HLS Ä‘Ã£ Ä‘Æ°á»£c kÃ½ tÃªn (Proxy).
     * TrÃ¬nh phÃ¡t video (hls.js) sáº½ gá»i vÃ o Ä‘Ã¢y.
     */
    @GetMapping(value = "/stream/{lessonId}/playlist.m3u8", produces = "application/x-mpegURL")
    public ResponseEntity<String> getHlsPlaylist(@PathVariable Long lessonId) {
        Long userId = getCurrentUserId();
        String playlistContent = videoService.getProxyHlsPlaylist(lessonId, userId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "application/x-mpegURL")
                // Quan trá»ng: Cháº·n cache Ä‘á»ƒ URL luÃ´n má»›i
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .body(playlistContent);
    }

    private Long getCurrentUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getUserId();
    }
}
