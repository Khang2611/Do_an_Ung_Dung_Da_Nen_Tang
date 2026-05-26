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
@Table(name = "enrollment")
public class Enrollment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "enrollment_id")
    Long enrollmentId;

    @Column(name = "user_id", nullable = false)
    Long userId;

    @Column(name = "course_id", nullable = false)
    Long courseId;

    @Column(name = "progress")
    Double progress; // e.g. 0.0 to 100.0

    @Column(name = "status", length = 50)
    String status; // e.g. ACTIVE, COMPLETED, CANCELLED

    @Column(name = "created_date")
    LocalDateTime createdDate;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        if (status == null) {
            status = "ACTIVE";
        }
        if (progress == null) {
            progress = 0.0;
        }
    }
}
