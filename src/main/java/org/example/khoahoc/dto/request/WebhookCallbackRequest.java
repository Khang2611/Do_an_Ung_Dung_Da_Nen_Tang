package org.example.khoahoc.dto.request;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WebhookCallbackRequest {
    Long transactionId;
    String transactionRef; // Mã giao dịch bên 3rd party
    String status; // SUCCESS / FAILED
}
