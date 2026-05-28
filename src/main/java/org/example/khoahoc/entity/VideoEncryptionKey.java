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
@Table(
        name = "video_encryption_key",
        uniqueConstraints = @UniqueConstraint(name = "uk_video_encryption_key_lesson", columnNames = "lesson_id")
)
public class VideoEncryptionKey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "key_id")
    Long keyId;

    @Column(name = "lesson_id", nullable = false)
    Long lessonId;

    @Column(name = "encryption_method", nullable = false, length = 30)
    String encryptionMethod;

    @Column(name = "encrypted_key", nullable = false, length = 255)
    String encryptedKey;

    @Column(name = "iv", nullable = false, length = 255)
    String iv;

    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
