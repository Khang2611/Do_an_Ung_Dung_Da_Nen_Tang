package org.example.khoahoc.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.config.JwtProperties;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final JwtProperties jwtProperties;
    // ─── Tạo SecretKey từ chuỗi Base64 trong config ──────────────────────────
    private SecretKey getSigningKey() {
        byte[] keyBytes = Base64.getDecoder().decode(jwtProperties.getSecret());
        return Keys.hmacShaKeyFor(keyBytes);
    }
    // ─── Sinh JWT token ───────────────────────────────────────────────────────
    /**
     * Tạo JWT token chứa username và role.
     *
     * @param username tên đăng nhập
     * @param role     vai trò (ADMIN, TEACHER, USER)
     * @return chuỗi JWT token
     */
    public String generateToken(String username, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtProperties.getExpirationMs());

        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .claim("type", "ACCESS")
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Tạo refresh token JWT chứa username với jti truyền vào.
     *
     * @param username tên đăng nhập
     * @param jti      mã định danh token duy nhất
     * @return chuỗi JWT refresh token
     */
    public String generateRefreshToken(String username, String jti) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtProperties.getRefreshExpirationMs());

        return Jwts.builder()
                .subject(username)
                .claim("type", "REFRESH")
                .claim("jti", jti)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Tạo refresh token JWT chứa username.
     * Refresh token có thời hạn dài hơn access token.
     *
     * @param username tên đăng nhập
     * @return chuỗi JWT refresh token
     */
    public String generateRefreshToken(String username) {
        return generateRefreshToken(username, UUID.randomUUID().toString());
    }

    // ─── Lấy username từ token ────────────────────────────────────────────────
    /**
     * Trích xuất username (subject) từ JWT token.
     *
     * @param token chuỗi JWT
     * @return username
     */
    public String getUsernameFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    // ─── Lấy role từ token ────────────────────────────────────────────────────
    /**
     * Trích xuất role từ JWT token.
     *
     * @param token chuỗi JWT
     * @return role dạng String (ví dụ: "ADMIN")
     */
    public String getRoleFromToken(String token) {
        return parseClaims(token).get("role", String.class);
    }

    // ─── Lấy loại token ──────────────────────────────────────────────────────
    /**
     * Trích xuất loại token (ACCESS hoặc REFRESH).
     *
     * @param token chuỗi JWT
     * @return loại token
     */
    public String getTokenType(String token) {
        return parseClaims(token).get("type", String.class);
    }

    /**
     * Trích xuất jti (JWT ID) từ JWT token.
     *
     * @param token chuỗi JWT
     * @return jti dạng String
     */
    public String getJtiFromToken(String token) {
        return parseClaims(token).get("jti", String.class);
    }

    // ─── Kiểm tra token hợp lệ ───────────────────────────────────────────────
    /**
     * Xác thực JWT token: chữ ký đúng và chưa hết hạn.
     *
     * @param token chuỗi JWT
     * @return true nếu hợp lệ, false nếu không
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException e) {
            log.warn("JWT không hợp lệ: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT token rỗng hoặc null: {}", e.getMessage());
        }
        return false;
    }

    /**
     * Kiểm tra xem token có phải refresh token không.
     *
     * @param token chuỗi JWT
     * @return true nếu là refresh token
     */
    public boolean isRefreshToken(String token) {
        try {
            String tokenType = getTokenType(token);
            return "REFRESH".equals(tokenType);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Lấy thời gian hết hạn của token.
     *
     * @param token chuỗi JWT
     * @return thời gian hết hạn dạng Date
     */
    public Date getExpirationDateFromToken(String token) {
        return parseClaims(token).getExpiration();
    }

    // ─── Parse Claims nội bộ ─────────────────────────────────────────────────
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
