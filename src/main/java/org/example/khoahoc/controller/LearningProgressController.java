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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning-progresses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LearningProgressController {

    LearningProgressService learningProgressService;

    @PostMapping
    public ResponseEntity<ApiResponse<LearningProgressResponse>> createLearningProgress(@RequestBody LearningProgressCreationRequest request) {
        LearningProgressResponse response = learningProgressService.createLearningProgress(request);
        
        ApiResponse<LearningProgressResponse> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Tạo tiến độ học tập thành công.");
        apiResponse.setResult(response);
        
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LearningProgressResponse>>> getAllLearningProgresses() {
        ApiResponse<List<LearningProgressResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(learningProgressService.getAllLearningProgresses());
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/enrollment/{enrollmentId}")
    public ResponseEntity<ApiResponse<List<LearningProgressResponse>>> getLearningProgressesByEnrollmentId(@PathVariable Long enrollmentId) {
        ApiResponse<List<LearningProgressResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(learningProgressService.getLearningProgressesByEnrollmentId(enrollmentId));
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LearningProgressResponse>> getLearningProgress(@PathVariable Long id) {
        ApiResponse<LearningProgressResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(learningProgressService.getLearningProgress(id));
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LearningProgressResponse>> updateLearningProgress(@PathVariable Long id, @RequestBody LearningProgressUpdateRequest request) {
        ApiResponse<LearningProgressResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(learningProgressService.updateLearningProgress(id, request));
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLearningProgress(@PathVariable Long id) {
        learningProgressService.deleteLearningProgress(id);
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Xóa tiến độ học tập thành công.");
        return ResponseEntity.ok(apiResponse);
    }
}
