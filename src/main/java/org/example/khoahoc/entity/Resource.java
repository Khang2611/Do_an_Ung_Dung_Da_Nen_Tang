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
@Table(name = "resource")
public class Resource {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resource_id")
    Long resourceId;

    @Column(name = "lesson_id", nullable = false)
    Long lessonId;

    @Column(name = "name", nullable = false, length = 255)
    String name;

    @Column(name = "url", nullable = false, length = 500)
    String url;

    @Column(name = "type", length = 50)
    String type; // e.g. PDF, DOCX, ZIP

    @Column(name = "created_date")
    LocalDateTime createdDate;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
    }
}
