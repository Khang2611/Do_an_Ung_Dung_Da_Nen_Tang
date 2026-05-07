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
     * Đăng ký tài khoản mới.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@RequestBody UserCreationRequest request) {
        ApiResponse<UserResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Đăng ký tài khoản thành công.");
        response.setResult(userService.createUser(request));
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/login
     * Đăng nhập, nhận JWT token.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        ApiResponse<LoginResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Đăng nhập thành công.");
        response.setResult(authService.login(request));
        return ResponseEntity.ok(response);
    }
}
