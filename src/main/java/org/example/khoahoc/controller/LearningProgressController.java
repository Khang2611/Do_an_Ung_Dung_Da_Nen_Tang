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
        return ResponseEntity.ok(ApiResponse.<LearningProgressResponse>builder()
                .code(200)
                .message("Tạo tiến độ học tập thành công.")
                .result(learningProgressService.createLearningProgress(request))
                .build());
    }

    // Chỉ ADMIN xem toàn bộ
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<LearningProgressResponse>>> getAllLearningProgresses() {
        return ResponseEntity.ok(ApiResponse.<List<LearningProgressResponse>>builder()
                .result(learningProgressService.getAllLearningProgresses())
                .build());
    }

    // USER/ADMIN/TEACHER xem tiến độ theo enrollmentId
    @GetMapping("/enrollment/{enrollmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'USER')")
    public ResponseEntity<ApiResponse<List<LearningProgressResponse>>> getLearningProgressesByEnrollmentId(@PathVariable Long enrollmentId) {
        return ResponseEntity.ok(ApiResponse.<List<LearningProgressResponse>>builder()
                .result(learningProgressService.getLearningProgressesByEnrollmentId(enrollmentId))
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'USER')")
    public ResponseEntity<ApiResponse<LearningProgressResponse>> getLearningProgress(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<LearningProgressResponse>builder()
                .result(learningProgressService.getLearningProgress(id))
                .build());
    }

    // USER tự cập nhật tiến độ (đánh dấu hoàn thành), ADMIN cũng được
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<LearningProgressResponse>> updateLearningProgress(@PathVariable Long id, @RequestBody LearningProgressUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.<LearningProgressResponse>builder()
                .result(learningProgressService.updateLearningProgress(id, request))
                .build());
    }

    // Chỉ ADMIN mới được xóa tiến độ
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteLearningProgress(@PathVariable Long id) {
        learningProgressService.deleteLearningProgress(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Xóa tiến độ học tập thành công.")
                .build());
    }
}
