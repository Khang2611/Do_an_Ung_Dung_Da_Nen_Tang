package com.example.paymentgateway.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

/** Gửi callback về KhoaHoc sau khi xử lý thanh toán xong */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WebhookCallbackRequest {
    String transactionRef; // gatewayRef
    Long orderId;
    Long userId;
    BigDecimal amount;
    String status;         // SUCCESS / FAILED
    String timestamp;
    String nonce;
}
