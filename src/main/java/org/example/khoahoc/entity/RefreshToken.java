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
@Table(name = "refresh_token", indexes = {
    @Index(name = "idx_user_revoked_order", columnList = "user_id,is_revoked,sort_order")
})
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "refresh_token_id")
    Long refreshTokenId;

    @Column(name = "jti", nullable = false, unique = true, length = 36)
    String jti;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Column(name = "sort_order", nullable = false)
    Long sortOrder;

    @Column(name = "device_fingerprint", length = 64)
    String deviceFingerprint;

    @Builder.Default
    @Column(name = "is_revoked")
    Boolean isRevoked = false;

    @Column(name = "issued_at", nullable = false)
    LocalDateTime issuedAt;

    @Column(name = "expires_at", nullable = false)
    LocalDateTime expiresAt;

    @Column(name = "revoked_at")
    LocalDateTime revokedAt;

    @Column(name = "created_date")
    LocalDateTime createdDate;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        if (issuedAt == null) {
            issuedAt = LocalDateTime.now();
        }
        if (sortOrder == null) {
            sortOrder = System.currentTimeMillis();
        }
    }

    /**
     * Kiểm tra xem refresh token còn hợp lệ không
     * @return true nếu token chưa hết hạn và chưa bị revoke
     */
    public boolean isValid() {
        return !isRevoked() && LocalDateTime.now().isBefore(expiresAt);
    }

    /**
     * Kiểm tra xem refresh token đã bị thu hồi chưa
     * @return true nếu đã bị thu hồi
     */
    public boolean isRevoked() {
        return isRevoked != null && isRevoked;
    }
}
