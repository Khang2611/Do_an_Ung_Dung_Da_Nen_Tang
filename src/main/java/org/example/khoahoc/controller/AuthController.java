package org.example.khoahoc.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.khoahoc.dto.request.LoginRequest;
import org.example.khoahoc.dto.request.LogoutRequest;
import org.example.khoahoc.dto.request.RefreshTokenRequest;
import org.example.khoahoc.dto.request.UserCreationRequest;
import org.example.khoahoc.dto.response.ActiveSessionResponse;
import org.example.khoahoc.dto.response.ApiResponse;
import org.example.khoahoc.dto.response.LoginResponse;
import org.example.khoahoc.dto.response.RefreshTokenResponse;
import org.example.khoahoc.dto.response.UserResponse;
import org.example.khoahoc.service.AuthService;

import java.util.List;
import org.example.khoahoc.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@RequestBody @Valid UserCreationRequest request) {
        ApiResponse<UserResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Đăng ký tài khoản thành công.");
        response.setResult(userService.createUser(request));
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/login
     * Đăng nhập, nhận access token và refresh token.
     * Implement sliding window: nếu vượt quá maxSessions, device cũ nhất bị revoke.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        ApiResponse<LoginResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Đăng nhập thành công.");
        response.setResult(authService.login(request, httpRequest));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        ApiResponse<UserResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(userService.getUserByUsername(username));
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/refresh
     * Làm mới access token bằng refresh token.
     *
     * Body: { "refreshToken": "..." }
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<RefreshTokenResponse>> refreshToken(
            @RequestBody @Valid RefreshTokenRequest request) {
        ApiResponse<RefreshTokenResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Làm mới access token thành công.");
        response.setResult(authService.refreshAccessToken(request));
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/logout
     * Đăng xuất tại thiết bị hiện tại: revoke refresh token.
     * Endpoint công khai nhưng giới hạn trong phạm vi user (chỉ logout token của chính user đó).
     * Không throw exception - logout luôn thành công.
     *
     * Body: { "refreshToken": "..." }
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logoutCurrentDevice(@RequestBody LogoutRequest request) {
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Đăng xuất tại thiết bị hiện tại thành công.");
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/logout-all
     * Đăng xuất ở tất cả thiết bị: revoke tất cả refresh token của user.
     * Yêu cầu xác thực (JWT)
     */
    @PostMapping("/logout-all")
    public ResponseEntity<ApiResponse<Void>> logoutAllDevices(Authentication authentication) {
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Đăng xuất ở tất cả thiết bị thành công.");
        String username = authentication.getName();
        authService.logoutAllDevices(username);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/auth/sessions
     * Lấy danh sách session active của user hiện tại.
     * Yêu cầu xác thực (JWT)
     */
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<ActiveSessionResponse>>> getActiveSessions(Authentication authentication) {
        ApiResponse<List<ActiveSessionResponse>> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Lấy danh sách session active thành công.");
        response.setResult(authService.getActiveSessions(authentication.getName()));
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/auth/sessions/{id}
     * Kick một session active cụ thể của user hiện tại.
     * Yêu cầu xác thực (JWT)
     */
    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<Void>> kickSession(Authentication authentication, @PathVariable("id") Long sessionId) {
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Thu hồi session thành công.");
        authService.kickSession(authentication.getName(), sessionId);
        return ResponseEntity.ok(response);
    }
}
