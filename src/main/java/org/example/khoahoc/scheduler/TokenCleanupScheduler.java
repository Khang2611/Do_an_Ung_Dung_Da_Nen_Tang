package org.example.khoahoc.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.service.AuthService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TokenCleanupScheduler {

    private final AuthService authService;

    /**
     * Chạy job dọn dẹp refresh token hết hạn và các token đã bị revoke quá 30 ngày.
     * Chạy vào lúc 1:00 sáng mỗi ngày.
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void cleanupTokens() {
        log.info("Bắt đầu chạy job dọn dẹp các refresh token...");
        try {
            authService.cleanupExpiredTokens();
            authService.cleanupOldRevokedTokens();
            log.info("Dọn dẹp các refresh token hoàn tất thành công.");
        } catch (Exception e) {
            log.error("Lỗi khi chạy job dọn dẹp refresh token: {}", e.getMessage(), e);
        }
    }
}
