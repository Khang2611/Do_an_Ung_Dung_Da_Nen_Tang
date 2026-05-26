package org.example.khoahoc.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

/**
 * Payload mà Payment Gateway gửi về LMS qua IPN (Instant Payment Notification).
 * Các fields phải khớp hoàn toàn với IpnCallbackRequest bên Gateway
 * để tái tạo chuỗi payload và xác thực chữ ký HMAC-SHA256.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WebhookCallbackRequest {
    String transactionRef; // Mã tham chiếu giao dịch (link với PaymentTransaction.transactionRef)
    Long orderId;
    Long userId;
    BigDecimal amount;
    String status;         // SUCCESS / FAILED
    String timestamp;
    String nonce;
}
