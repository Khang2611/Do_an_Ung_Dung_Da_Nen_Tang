package org.example.khoahoc.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentTransactionResponse {
    Long transactionId;
    Long userId;
    Long orderId;
    Double amount;
    String paymentMethod;
    String transactionRef;
    String status;
    String ipAddress;
    LocalDateTime createdDate;
}
