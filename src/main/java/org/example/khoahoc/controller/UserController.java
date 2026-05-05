package org.example.khoahoc.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.khoahoc.dto.request.RoleUpdateRequest;
import org.example.khoahoc.dto.request.UserUpdateRequest;
import org.example.khoahoc.dto.response.ApiResponse;
import org.example.khoahoc.dto.response.UserResponse;
import org.example.khoahoc.entity.User;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.repository.UserRepository;
import org.example.khoahoc.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    UserService userService;
    UserRepository userRepository;


    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        ApiResponse<List<UserResponse>> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(userService.getAllUsers());
        return ResponseEntity.ok(response);
    }

    // ADMIN và chính user đó mới được xem
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable Long id) {
        ApiResponse<UserResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(userService.getUser(id));
        return ResponseEntity.ok(response);
    }

    // Người dùng cập nhật thông tin cá nhân của chính họ 
    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('USER', 'TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserProfile(@RequestBody UserUpdateRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        ApiResponse<UserResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Cập nhật thông tin cá nhân thành công.");
        response.setResult(userService.updateUserProfile(currentUser.getUserId(), username, request));
        return ResponseEntity.ok(response);
    }

    // Chỉ ADMIN mới được cập nhật quyền người dùng
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(@PathVariable Long id, @RequestBody RoleUpdateRequest request) {
        ApiResponse<UserResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Cập nhật quyền thành công.");
        response.setResult(userService.updateUserRole(id, request.getRole()));
        return ResponseEntity.ok(response);
    }

    // Chỉ ADMIN mới được xóa user
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Xóa người dùng thành công.");
        return ResponseEntity.ok(response);
    }
}
