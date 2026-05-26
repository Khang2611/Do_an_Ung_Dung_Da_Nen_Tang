package org.example.khoahoc.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "auth")
public class AuthProperties {

    /**
     * Số session tối đa mỗi user có thể có đồng thời
     * Khi vượt quá, session cũ nhất sẽ bị revoke (sliding window)
     */
    private int maxSessionsPerUser = 5;
}
