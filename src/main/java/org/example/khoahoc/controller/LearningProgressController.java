package org.example.khoahoc.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.khoahoc.dto.request.LearningProgressCreationRequest;
import org.example.khoahoc.dto.request.LearningProgressUpdateRequest;
import org.example.khoahoc.dto.response.ApiResponse;
import org.example.khoahoc.dto.response.LearningProgressResponse;
import org.example.khoahoc.service.LearningProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning-progresses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LearningProgressController {

    LearningProgressService learningProgressService;

    // USER tạo tiến độ học tập của mình, ADMIN cũng có thể tạo
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<LearningProgressResponse>> createLearningProgress(@RequestBody LearningProgressCreationRequest request) {
        ApiResponse<LearningProgressResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Tạo tiến độ học tập thành công.");
        response.setResult(learningProgressService.createLearningProgress(request));
        return ResponseEntity.ok(response);
    }

    // Chỉ ADMIN xem toàn bộ
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<LearningProgressResponse>>> getAllLearningProgresses() {
        ApiResponse<List<LearningProgressResponse>> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(learningProgressService.getAllLearningProgresses());
        return ResponseEntity.ok(response);
    }

    // USER/ADMIN/TEACHER xem tiến độ theo enrollmentId
    @GetMapping("/enrollment/{enrollmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'USER')")
    public ResponseEntity<ApiResponse<List<LearningProgressResponse>>> getLearningProgressesByEnrollmentId(@PathVariable Long enrollmentId) {
        ApiResponse<List<LearningProgressResponse>> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(learningProgressService.getLearningProgressesByEnrollmentId(enrollmentId));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'USER')")
    public ResponseEntity<ApiResponse<LearningProgressResponse>> getLearningProgress(@PathVariable Long id) {
        ApiResponse<LearningProgressResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(learningProgressService.getLearningProgress(id));
        return ResponseEntity.ok(response);
    }

    // USER tự cập nhật tiến độ (đánh dấu hoàn thành), ADMIN cũng được
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<LearningProgressResponse>> updateLearningProgress(@PathVariable Long id, @RequestBody LearningProgressUpdateRequest request) {
        ApiResponse<LearningProgressResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(learningProgressService.updateLearningProgress(id, request));
        return ResponseEntity.ok(response);
    }

    // Chỉ ADMIN mới được xóa tiến độ
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteLearningProgress(@PathVariable Long id) {
        learningProgressService.deleteLearningProgress(id);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Xóa tiến độ học tập thành công.");
        return ResponseEntity.ok(response);
    }
}
