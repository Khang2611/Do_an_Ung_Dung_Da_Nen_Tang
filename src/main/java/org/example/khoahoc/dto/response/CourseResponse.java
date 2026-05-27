package org.example.khoahoc.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseResponse {
    Long courseId;
    String title;
    String description;
    String thumbnail;
    Double price;
    LocalDateTime createdDate;
    CategoryResponse category;
}
