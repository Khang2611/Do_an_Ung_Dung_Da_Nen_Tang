package org.example.khoahoc.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.config.JwtProperties;
import org.example.khoahoc.dto.request.LoginRequest;
import org.example.khoahoc.dto.response.LoginResponse;
import org.example.khoahoc.entity.User;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.repository.UserRepository;
import org.example.khoahoc.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthService {

    UserRepository userRepository;
    JwtTokenProvider jwtTokenProvider;
    JwtProperties jwtProperties;
    PasswordEncoder passwordEncoder;

    /**
     * Xác thực tên đăng nhập và mật khẩu, trả về JWT token nếu hợp lệ.
     *
     * @param request chứa username và password từ client
     * @return LoginResponse với accessToken và thông tin user
     */
    public LoginResponse login(LoginRequest request) {
        log.info("Đăng nhập với username: {}", request.getUsername());

        // 1. Tìm user trong DB
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

        // 2. Kiểm tra mật khẩu bằng PasswordEncoder
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        // 3. Sinh JWT token
        String roleName = user.getRole().name(); // "ADMIN", "TEACHER", "USER"
        String token = jwtTokenProvider.generateToken(user.getUsername(), roleName);

        log.info("Đăng nhập thành công: username={}, role={}", user.getUsername(), roleName);

        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .username(user.getUsername())
                .role(roleName)
                .expiresIn(jwtProperties.getExpirationMs())
                .build();
    }
}
