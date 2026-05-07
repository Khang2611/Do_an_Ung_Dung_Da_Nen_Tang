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
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
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

    // ─── Parse Claims nội bộ ─────────────────────────────────────────────────
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
