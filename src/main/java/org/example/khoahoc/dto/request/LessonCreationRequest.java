package org.example.khoahoc.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonCreationRequest {
    Long chapterId;
    String title;
    String content;
    String videoUrl;
    Integer duration;
    Integer orderIndex;
}
