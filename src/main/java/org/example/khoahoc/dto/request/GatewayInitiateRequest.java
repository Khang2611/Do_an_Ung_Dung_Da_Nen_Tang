package org.example.khoahoc.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

/**
 * DTO mà LMS dùng để gọi API initiate payment của Gateway.
 * Cấu trúc khớp với InitiatePaymentRequest bên Gateway.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GatewayInitiateRequest {
    String transactionRef;
    Long orderId;
    Long userId;
    BigDecimal amount;
    String returnUrl;
    String ipnUrl;
    String timestamp;
    String nonce;
}
