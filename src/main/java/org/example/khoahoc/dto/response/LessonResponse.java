package org.example.khoahoc.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonResponse {
    Long lessonId;
    Long chapterId;
    String title;
    String content;
    String videoUrl;
    Integer duration;
    Integer orderIndex;
    LocalDateTime createdDate;
}
