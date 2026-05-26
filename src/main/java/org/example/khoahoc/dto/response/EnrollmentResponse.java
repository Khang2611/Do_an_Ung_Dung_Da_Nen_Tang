package org.example.khoahoc.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EnrollmentResponse {
    Long enrollmentId;
    Long userId;
    Long courseId;
    Double progress;
    String status;
    LocalDateTime createdDate;
}
