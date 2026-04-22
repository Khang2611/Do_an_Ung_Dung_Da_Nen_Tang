package org.example.khoahoc.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.khoahoc.dto.request.LoginRequest;
import org.example.khoahoc.dto.request.UserCreationRequest;
import org.example.khoahoc.dto.response.ApiResponse;
import org.example.khoahoc.dto.response.LoginResponse;
import org.example.khoahoc.dto.response.UserResponse;
import org.example.khoahoc.service.AuthService;
import org.example.khoahoc.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthController {

    AuthService authService;
    UserService userService;

    /**
     * POST /api/auth/register
     * Đăng ký tài khoản mới.
     *
     * Body: { "username": "...", "password": "..." }
     */
    /**
     * POST /api/auth/register
     * Đăng ký tài khoản mới. Không yêu cầu xác thực.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@RequestBody UserCreationRequest request) {
        return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                .code(200)
                .message("Đăng ký tài khoản thành công.")
                .result(userService.createUser(request))
                .build());
    }

    /**
     * POST /api/auth/login
     * Đăng nhập, nhận JWT token.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.<LoginResponse>builder()
                .code(200)
                .message("Đăng nhập thành công.")
                .result(authService.login(request))
                .build());
    }
}
