package org.example.khoahoc.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TransactionItemResponse {
    Long itemId;
    Long transactionId;
    Long courseId;
    Double amount;
    LocalDateTime createdDate;
}
