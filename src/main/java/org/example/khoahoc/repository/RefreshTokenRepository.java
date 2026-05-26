package org.example.khoahoc.repository;

import org.example.khoahoc.entity.RefreshToken;
import org.example.khoahoc.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    /**
     * Tìm refresh token theo jti
     */
    Optional<RefreshToken> findByJti(String jti);

    /**
     * Tìm tất cả refresh token hợp lệ của một user (không bị revoke và chưa hết hạn)
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.user = :user AND rt.isRevoked = false AND rt.expiresAt > CURRENT_TIMESTAMP")
    List<RefreshToken> findValidTokensByUser(@Param("user") User user);

    /**
     * Tìm tất cả refresh token của một user (bất kể trạng thái)
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.user = :user")
    List<RefreshToken> findByUser(@Param("user") User user);

    /**
     * Đếm số refresh token hợp lệ của một user
     */
    @Query("SELECT COUNT(rt) FROM RefreshToken rt WHERE rt.user = :user AND rt.isRevoked = false AND rt.expiresAt > CURRENT_TIMESTAMP")
    long countValidTokensByUser(@Param("user") User user);

    /**
     * Tìm token cũ nhất (sort_order nhỏ nhất) hợp lệ của user
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.user = :user AND rt.isRevoked = false AND rt.expiresAt > CURRENT_TIMESTAMP ORDER BY rt.sortOrder ASC LIMIT 1")
    Optional<RefreshToken> findOldestValidTokenByUser(@Param("user") User user);

    /**
     * Tìm token theo user và device fingerprint dựa trên jti
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.jti = :jti AND rt.user.userId = :userId")
    Optional<RefreshToken> findByJtiAndUserId(@Param("jti") String jti, @Param("userId") Long userId);

    /**
     * Xóa tất cả refresh token hết hạn
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt <= CURRENT_TIMESTAMP")
    void deleteExpiredTokens();

    /**
     * Xóa tất cả refresh token đã revoke quá 30 ngày
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken rt WHERE rt.isRevoked = true AND rt.revokedAt <= :thirtyDaysAgo")
    void deleteOldRevokedTokens(@Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);

    /**
     * Kiểm tra xem jti còn tồn tại và hợp lệ
     */
    @Query("SELECT CASE WHEN COUNT(rt) > 0 THEN true ELSE false END FROM RefreshToken rt WHERE rt.jti = :jti AND rt.isRevoked = false AND rt.expiresAt > CURRENT_TIMESTAMP")
    boolean isJtiValid(@Param("jti") String jti);

    /**
     * Tìm token theo device fingerprint
     */
    @Query("SELECT rt FROM RefreshToken rt WHERE rt.user = :user AND rt.deviceFingerprint = :deviceFingerprint AND rt.isRevoked = false AND rt.expiresAt > CURRENT_TIMESTAMP")
    Optional<RefreshToken> findValidTokenByUserAndDevice(@Param("user") User user, @Param("deviceFingerprint") String deviceFingerprint);
}
