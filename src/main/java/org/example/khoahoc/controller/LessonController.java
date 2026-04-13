package org.example.khoahoc.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.khoahoc.dto.request.LessonCreationRequest;
import org.example.khoahoc.dto.request.LessonUpdateRequest;
import org.example.khoahoc.dto.response.ApiResponse;
import org.example.khoahoc.dto.response.LessonResponse;
import org.example.khoahoc.service.LessonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LessonController {

    LessonService lessonService;

    @PostMapping
    public ResponseEntity<ApiResponse<LessonResponse>> createLesson(@RequestBody LessonCreationRequest request) {
        LessonResponse response = lessonService.createLesson(request);
        
        ApiResponse<LessonResponse> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Tạo bài học thành công.");
        apiResponse.setResult(response);
        
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LessonResponse>>> getAllLessons() {
        ApiResponse<List<LessonResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(lessonService.getAllLessons());
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/chapter/{chapterId}")
    public ResponseEntity<ApiResponse<List<LessonResponse>>> getLessonsByChapterId(@PathVariable Long chapterId) {
        ApiResponse<List<LessonResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(lessonService.getLessonsByChapterId(chapterId));
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LessonResponse>> getLesson(@PathVariable Long id) {
        ApiResponse<LessonResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(lessonService.getLesson(id));
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LessonResponse>> updateLesson(@PathVariable Long id, @RequestBody LessonUpdateRequest request) {
        ApiResponse<LessonResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(lessonService.updateLesson(id, request));
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLesson(@PathVariable Long id) {
        lessonService.deleteLesson(id);
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Xóa bài học thành công.");
        return ResponseEntity.ok(apiResponse);
    }
}
