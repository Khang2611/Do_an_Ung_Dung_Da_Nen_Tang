package org.example.khoahoc.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.khoahoc.dto.request.EnrollmentCreationRequest;
import org.example.khoahoc.dto.request.EnrollmentUpdateRequest;
import org.example.khoahoc.dto.response.ApiResponse;
import org.example.khoahoc.dto.response.EnrollmentResponse;
import org.example.khoahoc.dto.response.MyEnrollmentResponse;
import org.example.khoahoc.entity.User;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.repository.UserRepository;
import org.example.khoahoc.service.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EnrollmentController {

    EnrollmentService enrollmentService;
    UserRepository userRepository;

    // USER tự đăng ký khóa học, ADMIN cũng có thể tạo
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> createEnrollment(@RequestBody EnrollmentCreationRequest request) {
        ApiResponse<EnrollmentResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Tạo đăng ký khóa học thành công.");
        response.setResult(enrollmentService.createEnrollment(request));
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/enrollments/me
     * Trả về danh sách khóa học đã đăng ký của chính user đang đăng nhập,
     * kèm thông tin đầy đủ của khóa học (tên, mô tả, giá).
     */
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<MyEnrollmentResponse>>> getMyEnrollments() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        ApiResponse<List<MyEnrollmentResponse>> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Danh sách khóa học đã đăng ký");
        response.setResult(enrollmentService.getMyEnrollments(user.getUserId()));
        return ResponseEntity.ok(response);
    }

    // Chỉ ADMIN xem toàn bộ enrollment
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getAllEnrollments() {
        ApiResponse<List<EnrollmentResponse>> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(enrollmentService.getAllEnrollments());
        return ResponseEntity.ok(response);
    }

    // USER/ADMIN có thể xem enrollment theo userId
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getEnrollmentsByUserId(@PathVariable Long userId) {
        ApiResponse<List<EnrollmentResponse>> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(enrollmentService.getEnrollmentsByUserId(userId));
        return ResponseEntity.ok(response);
    }

    // ADMIN và TEACHER xem enrollment theo courseId
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getEnrollmentsByCourseId(@PathVariable Long courseId) {
        ApiResponse<List<EnrollmentResponse>> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(enrollmentService.getEnrollmentsByCourseId(courseId));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> getEnrollment(@PathVariable Long id) {
        ApiResponse<EnrollmentResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(enrollmentService.getEnrollment(id));
        return ResponseEntity.ok(response);
    }

    // Chỉ ADMIN mới được cập nhật/xóa enrollment
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> updateEnrollment(@PathVariable Long id, @RequestBody EnrollmentUpdateRequest request) {
        ApiResponse<EnrollmentResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(enrollmentService.updateEnrollment(id, request));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEnrollment(@PathVariable Long id) {
        enrollmentService.deleteEnrollment(id);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Xóa đăng ký khóa học thành công.");
        return ResponseEntity.ok(response);
    }
}
