package org.example.khoahoc.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {

    /**
     * Khóa bí mật để ký JWT — đọc từ application.properties (jwt.secret)
     */
    private String secret;

    /**
     * Thời gian hết hạn access token tính bằng millisecond — đọc từ jwt.expiration.ms
     */
    private long expirationMs = 86400000; // 24 hours

    /**
     * Thời gian hết hạn refresh token tính bằng millisecond — đọc từ jwt.refresh.expiration.ms
     */
    private long refreshExpirationMs = 604800000; // 7 days (604800000 ms)
}
