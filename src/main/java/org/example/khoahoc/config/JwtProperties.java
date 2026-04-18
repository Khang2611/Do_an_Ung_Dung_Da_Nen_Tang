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
     * Thời gian hết hạn token tính bằng millisecond — đọc từ jwt.expiration.ms
     */
    private long expirationMs = 86400000;
}
