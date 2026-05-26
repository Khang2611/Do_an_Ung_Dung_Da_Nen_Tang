package org.example.khoahoc.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChapterResponse {
    Long chapterId;
    Long courseId;
    String title;
    Integer orderIndex;
    LocalDateTime createdDate;
}
