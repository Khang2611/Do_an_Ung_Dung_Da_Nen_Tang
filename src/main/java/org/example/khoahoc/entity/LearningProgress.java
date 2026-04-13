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
@Table(name = "learning_progress")
public class LearningProgress {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "progress_id")
    Long progressId;

    @Column(name = "enrollment_id", nullable = false)
    Long enrollmentId;

    @Column(name = "lesson_id", nullable = false)
    Long lessonId;

    @Column(name = "is_completed")
    Boolean isCompleted;

    @Column(name = "completed_date")
    LocalDateTime completedDate;

    @PrePersist
    protected void onCreate() {
        if (isCompleted == null) {
            isCompleted = false;
        }
        if (isCompleted && completedDate == null) {
            completedDate = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        if (Boolean.TRUE.equals(isCompleted) && completedDate == null) {
            completedDate = LocalDateTime.now();
        }
    }
}
