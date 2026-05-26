package org.example.khoahoc.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentTransactionCreationRequest {
    Long userId;
    Long orderId;
    Long courseId;      // Tự động lấy giá từ Course.price
    String paymentMethod;
    String ipAddress;
}
