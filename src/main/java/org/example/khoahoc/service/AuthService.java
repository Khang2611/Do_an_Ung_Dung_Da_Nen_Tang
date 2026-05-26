package org.example.khoahoc.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.config.AuthProperties;
import org.example.khoahoc.config.JwtProperties;
import org.example.khoahoc.dto.request.LoginRequest;
import org.example.khoahoc.dto.request.RefreshTokenRequest;
import org.example.khoahoc.dto.response.ActiveSessionResponse;
import org.example.khoahoc.dto.response.LoginResponse;
import org.example.khoahoc.dto.response.RefreshTokenResponse;
import org.example.khoahoc.entity.RefreshToken;
import org.example.khoahoc.entity.User;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.repository.RefreshTokenRepository;
import org.example.khoahoc.repository.UserRepository;
import org.example.khoahoc.security.DeviceFingerprintUtil;
import org.example.khoahoc.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthService {

    UserRepository userRepository;
    RefreshTokenRepository refreshTokenRepository;
    JwtTokenProvider jwtTokenProvider;
    JwtProperties jwtProperties;
    AuthProperties authProperties;
    PasswordEncoder passwordEncoder;
    DeviceFingerprintUtil deviceFingerprintUtil;

    /**
     * Xác thực tên đăng nhập và mật khẩu, trả về JWT token nếu hợp lệ.
     * Implement sliding window: nếu vượt quá maxSessions, revoke token cũ nhất.
     *
     * @param request chứa username, password và HttpServletRequest
     * @return LoginResponse với accessToken, refreshToken và thông tin user
     */
    @Transactional
    public LoginResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        log.info("Đăng nhập với username: {}", request.getUsername());
        // 1. Tìm user trong DB
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

        // 2. Kiểm tra mật khẩu bằng PasswordEncoder
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
        // 3. Sinh JWT token (access token)
        String roleName = user.getRole().name(); // "ADMIN", "TEACHER", "USER"
        String accessToken = jwtTokenProvider.generateToken(user.getUsername(), roleName);
        // 4. Sinh refresh token
        String jti = java.util.UUID.randomUUID().toString();
        String refreshTokenString = jwtTokenProvider.generateRefreshToken(user.getUsername(), jti);

        // 5. Tạo device fingerprint
        String deviceFingerprint = deviceFingerprintUtil.generateDeviceFingerprint(httpRequest);

        // 6. Lưu refresh token vào database
        RefreshToken refreshToken = RefreshToken.builder()
                .jti(jti)
                .user(user)
                .deviceFingerprint(deviceFingerprint)
                .sortOrder(System.currentTimeMillis())
                .isRevoked(false)
                .issuedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusSeconds(jwtProperties.getRefreshExpirationMs() / 1000))
                .build();
        refreshTokenRepository.save(refreshToken);

        // 7. Sliding Window: Nếu vượt quá maxSessions, revoke token cũ nhất
        long activeCount = refreshTokenRepository.countValidTokensByUser(user);
        int maxSessions = authProperties.getMaxSessionsPerUser();

        if (activeCount > maxSessions) {
            log.info("User {} có {} active sessions, vượt quá max {}, revoke token cũ nhất",
                    user.getUsername(), activeCount, maxSessions);

            // Tìm token cũ nhất (sort_order nhỏ nhất)
            var oldestToken = refreshTokenRepository.findOldestValidTokenByUser(user);
            if (oldestToken.isPresent()) {
                RefreshToken tokenToRevoke = oldestToken.get();
                tokenToRevoke.setIsRevoked(true);
                tokenToRevoke.setRevokedAt(LocalDateTime.now());
                refreshTokenRepository.save(tokenToRevoke);
                log.info("Revoke token cũ nhất cho user: {}", user.getUsername());
            }
        }

        log.info("Đăng nhập thành công: username={}, role={}, device={}",
                user.getUsername(), roleName, deviceFingerprint);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenString)
                .tokenType("Bearer")
                .username(user.getUsername())
                .role(roleName)
                .expiresIn(jwtProperties.getExpirationMs())
                .build();
    }

    /**
     * Refresh access token bằng refresh token.
     *
     * @param request chứa refresh token
     * @return RefreshTokenResponse với access token mới
     */
    public RefreshTokenResponse refreshAccessToken(RefreshTokenRequest request) {
        log.info("Làm mới access token");

        // 1. Validate refresh token format
        if (!jwtTokenProvider.validateToken(request.getRefreshToken())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        // 2. Kiểm tra xem có phải refresh token
        if (!jwtTokenProvider.isRefreshToken(request.getRefreshToken())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        // 3. Tìm refresh token trong database bằng jti
        String jti = jwtTokenProvider.getJtiFromToken(request.getRefreshToken());
        RefreshToken refreshToken = refreshTokenRepository.findByJti(jti)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

        // 4. Kiểm tra xem token có hợp lệ không (chưa bị revoke và chưa hết hạn)
        if (!refreshToken.isValid()) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        // 5. Lấy username từ token
        String username = jwtTokenProvider.getUsernameFromToken(request.getRefreshToken());

        // 6. Tìm user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

        // 7. Sinh access token mới
        String roleName = user.getRole().name();
        String newAccessToken = jwtTokenProvider.generateToken(username, roleName);

        log.info("Làm mới access token thành công cho user: {}", username);

        return RefreshTokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(request.getRefreshToken())
                .tokenType("Bearer")
                .expiresIn(jwtProperties.getExpirationMs())
                .build();
    }

    /**
     * Đăng xuất tại thiết bị hiện tại: revoke refresh token.
     * Không throw exception - logout luôn thành công (idempotent).
     * Kiểm tra ownership: lấy username từ token, validate với user trong DB.
     *
     * @param refreshTokenString refresh token cần revoke
     */
    public void logout(String refreshTokenString) {
        log.info("Đăng xuất tại thiết bị hiện tại: revoke refresh token");

        if (refreshTokenString == null || refreshTokenString.trim().isEmpty()) {
            log.warn("Refresh token trống, bỏ qua logout");
            return;
        }

        try {
            // 1. Lấy username từ JWT token (không validate chữ ký, chỉ decode)
            String username = jwtTokenProvider.getUsernameFromToken(refreshTokenString);

            // 2. Tìm user
            User user = userRepository.findByUsername(username).orElse(null);
            if (user == null) {
                log.warn("User {} không tồn tại", username);
                return;
            }

            // 3. Tìm refresh token trong database bằng jti
            String jti = jwtTokenProvider.getJtiFromToken(refreshTokenString);
            RefreshToken refreshToken = refreshTokenRepository.findByJti(jti).orElse(null);
            if (refreshToken == null) {
                log.warn("Refresh token không tồn tại trong DB");
                return;
            }

            // 4. Validate ownership: token phải thuộc về user này
            if (!refreshToken.getUser().getUserId().equals(user.getUserId())) {
                log.warn("Token không thuộc về user {}", username);
                return;
            }

            // 5. Nếu token chưa revoke, revoke nó
            if (!refreshToken.isRevoked()) {
                refreshToken.setIsRevoked(true);
                refreshToken.setRevokedAt(LocalDateTime.now());
                refreshTokenRepository.save(refreshToken);
                log.info("Revoke refresh token thành công cho user: {}", username);
            } else {
                log.debug("Token đã được revoke, bỏ qua");
            }
        } catch (Exception e) {
            // Không throw exception, logout chắc chắn thành công
            log.debug("Lỗi khi logout: {}", e.getMessage());
        }
    }

    /**
     * Thu hồi tất cả refresh token của một user (logout ở tất cả thiết bị).
     *
     * @param username username của user
     */
    public void logoutAllDevices(String username) {
        log.info("Đăng xuất ở tất cả thiết bị cho user: {}", username);

        try {
            // 1. Tìm user
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

            // 2. Lấy tất cả refresh token hợp lệ của user
            var validTokens = refreshTokenRepository.findValidTokensByUser(user);

            // 3. Revoke tất cả token
            validTokens.forEach(token -> {
                token.setIsRevoked(true);
                token.setRevokedAt(LocalDateTime.now());
            });
            refreshTokenRepository.saveAll(validTokens);

            log.info("Revoke tất cả refresh token thành công cho user: {}", username);
        } catch (Exception e) {
            log.warn("Lỗi khi logout all devices: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Xóa tất cả refresh token hết hạn.
     */
    public void cleanupExpiredTokens() {
        log.info("Xóa tất cả refresh token hết hạn");
        refreshTokenRepository.deleteExpiredTokens();
    }

    /**
     * Lấy danh sách session active của user.
     *
     * @param username username của user
     * @return danh sách các ActiveSessionResponse
     */
    public List<ActiveSessionResponse> getActiveSessions(String username) {
        log.info("Lấy danh sách session active của user: {}", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        List<RefreshToken> validTokens = refreshTokenRepository.findValidTokensByUser(user);

        return validTokens.stream()
                .map(token -> ActiveSessionResponse.builder()
                        .sessionId(token.getRefreshTokenId())
                        .deviceFingerprint(token.getDeviceFingerprint())
                        .lastUsed(token.getIssuedAt())
                        .expiresAt(token.getExpiresAt())
                        .build())
                .toList();
    }

    /**
     * Revoke một session cụ thể theo ID.
     * Yêu cầu kiểm tra ownership: session phải thuộc về user này.
     *
     * @param username  username của user yêu cầu
     * @param sessionId ID của refresh token cần revoke
     */
    @Transactional
    public void kickSession(String username, Long sessionId) {
        log.info("User {} yêu cầu kick session: {}", username, sessionId);

        // 1. Tìm user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Tìm refresh token theo ID
        RefreshToken refreshToken = refreshTokenRepository.findById(sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        // 3. Kiểm tra xem session có thuộc về user này không
        if (!refreshToken.getUser().getUserId().equals(user.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED_ACTION);
        }

        // 4. Nếu chưa revoke, revoke nó
        if (!refreshToken.isRevoked()) {
            refreshToken.setIsRevoked(true);
            refreshToken.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(refreshToken);
            log.info("Kick session {} thành công cho user: {}", sessionId, username);
        }
    }

    /**
     * Xóa tất cả refresh token đã revoke quá 30 ngày.
     */
    public void cleanupOldRevokedTokens() {
        log.info("Xóa tất cả refresh token đã revoke quá 30 ngày");
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        refreshTokenRepository.deleteOldRevokedTokens(thirtyDaysAgo);
    }
}
