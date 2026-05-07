package org.example.khoahoc.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

/**
 * Response trả về sau khi đăng ký thành công hoặc khi user xem lại danh sách khóa học đã mua.
 * Bao gồm thông tin khóa học (tên, mô tả, giá) thay vì chỉ trả courseId.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MyEnrollmentResponse {
    Long enrollmentId;
    String status;
    Double progress;
    LocalDateTime enrolledAt;

    // Thông tin khóa học
    Long courseId;
    String courseTitle;
    String courseDescription;
    Double coursePrice;
}
