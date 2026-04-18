package org.example.khoahoc.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.khoahoc.dto.request.EnrollmentCreationRequest;
import org.example.khoahoc.dto.request.EnrollmentUpdateRequest;
import org.example.khoahoc.dto.response.ApiResponse;
import org.example.khoahoc.dto.response.EnrollmentResponse;
import org.example.khoahoc.service.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EnrollmentController {

    EnrollmentService enrollmentService;

    // USER tự đăng ký khóa học, ADMIN cũng có thể tạo
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> createEnrollment(@RequestBody EnrollmentCreationRequest request) {
        return ResponseEntity.ok(ApiResponse.<EnrollmentResponse>builder()
                .code(200)
                .message("Tạo đăng ký khóa học thành công.")
                .result(enrollmentService.createEnrollment(request))
                .build());
    }

    // Chỉ ADMIN xem toàn bộ enrollment
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getAllEnrollments() {
        return ResponseEntity.ok(ApiResponse.<List<EnrollmentResponse>>builder()
                .result(enrollmentService.getAllEnrollments())
                .build());
    }

    // USER/ADMIN có thể xem enrollment theo userId
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getEnrollmentsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.<List<EnrollmentResponse>>builder()
                .result(enrollmentService.getEnrollmentsByUserId(userId))
                .build());
    }

    // ADMIN và TEACHER xem enrollment theo courseId
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getEnrollmentsByCourseId(@PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.<List<EnrollmentResponse>>builder()
                .result(enrollmentService.getEnrollmentsByCourseId(courseId))
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> getEnrollment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<EnrollmentResponse>builder()
                .result(enrollmentService.getEnrollment(id))
                .build());
    }

    // Chỉ ADMIN mới được cập nhật/xóa enrollment
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> updateEnrollment(@PathVariable Long id, @RequestBody EnrollmentUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.<EnrollmentResponse>builder()
                .result(enrollmentService.updateEnrollment(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEnrollment(@PathVariable Long id) {
        enrollmentService.deleteEnrollment(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Xóa đăng ký khóa học thành công.")
                .build());
    }
}
