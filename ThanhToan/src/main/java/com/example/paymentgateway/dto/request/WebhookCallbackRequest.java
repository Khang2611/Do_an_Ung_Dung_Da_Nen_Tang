package com.example.paymentgateway.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

/** Gửi callback về KhoaHoc sau khi xử lý thanh toán xong */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WebhookCallbackRequest {
    Long transactionId;    // khoahocTransactionId
    String transactionRef; // gatewayRef
    String status;         // SUCCESS / FAILED
}
