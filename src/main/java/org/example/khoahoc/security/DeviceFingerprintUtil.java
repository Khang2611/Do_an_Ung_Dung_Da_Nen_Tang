package org.example.khoahoc.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

@Slf4j
@Component
public class DeviceFingerprintUtil {

    /**
     * Tạo device fingerprint từ user-agent và IP address
     * Dùng SHA-256 hash để tạo 64-char string
     *
     * @param request HTTP request từ client
     * @return device fingerprint (64 chars)
     */
    public String generateDeviceFingerprint(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        String ipAddress = getClientIpAddress(request);

        if (userAgent == null) {
            userAgent = "unknown";
        }

        String fingerprint = userAgent + "|" + ipAddress;
        return hashSHA256(fingerprint);
    }

    /**
     * Lấy IP address của client từ request
     * Hỗ trợ proxy, load balancer (X-Forwarded-For header)
     *
     * @param request HTTP request
     * @return IP address
     */
    private String getClientIpAddress(HttpServletRequest request) {
        // Kiểm tra X-Forwarded-For (proxy, load balancer)
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isEmpty()) {
            // X-Forwarded-For có thể chứa nhiều IPs, lấy cái đầu tiên
            return forwardedFor.split(",")[0].trim();
        }

        // Kiểm tra X-Real-IP (nginx proxy)
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isEmpty()) {
            return realIp;
        }

        // IP từ request
        return request.getRemoteAddr();
    }

    /**
     * Hash SHA-256 của một string
     *
     * @param input input string
     * @return base64 encoded hash (64 chars)
     */
    private String hashSHA256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-256 not available", e);
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }
}
