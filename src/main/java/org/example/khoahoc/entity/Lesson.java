package org.example.khoahoc.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "lesson")
public class Lesson {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lesson_id")
    Long lessonId;

    @Column(name = "chapter_id", nullable = false)
    Long chapterId;

    @Column(name = "title", nullable = false, length = 200)
    String title;

    @Column(name = "content", columnDefinition = "TEXT")
    String content;

    @Column(name = "video_url", length = 500)
    String videoUrl;

    @Column(name = "duration")
    Integer duration; // in seconds or minutes

    @Column(name = "order_index")
    Integer orderIndex;

    @Column(name = "created_date")
    LocalDateTime createdDate;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
    }
}
