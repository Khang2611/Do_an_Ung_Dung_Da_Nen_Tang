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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EnrollmentController {

    EnrollmentService enrollmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<EnrollmentResponse>> createEnrollment(@RequestBody EnrollmentCreationRequest request) {
        EnrollmentResponse response = enrollmentService.createEnrollment(request);
        
        ApiResponse<EnrollmentResponse> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Tạo đăng ký khóa học thành công.");
        apiResponse.setResult(response);
        
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getAllEnrollments() {
        ApiResponse<List<EnrollmentResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(enrollmentService.getAllEnrollments());
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getEnrollmentsByUserId(@PathVariable Long userId) {
        ApiResponse<List<EnrollmentResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(enrollmentService.getEnrollmentsByUserId(userId));
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getEnrollmentsByCourseId(@PathVariable Long courseId) {
        ApiResponse<List<EnrollmentResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(enrollmentService.getEnrollmentsByCourseId(courseId));
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> getEnrollment(@PathVariable Long id) {
        ApiResponse<EnrollmentResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(enrollmentService.getEnrollment(id));
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> updateEnrollment(@PathVariable Long id, @RequestBody EnrollmentUpdateRequest request) {
        ApiResponse<EnrollmentResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(enrollmentService.updateEnrollment(id, request));
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEnrollment(@PathVariable Long id) {
        enrollmentService.deleteEnrollment(id);
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Xóa đăng ký khóa học thành công.");
        return ResponseEntity.ok(apiResponse);
    }
}
