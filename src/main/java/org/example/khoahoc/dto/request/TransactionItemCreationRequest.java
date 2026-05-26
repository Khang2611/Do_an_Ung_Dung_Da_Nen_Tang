package org.example.khoahoc.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TransactionItemCreationRequest {
    Long transactionId;
    Long courseId;
    Double amount;
}
