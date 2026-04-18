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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LessonController {

    LessonService lessonService;

    // ADMIN và TEACHER mới được tạo bài học
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<LessonResponse>> createLesson(@RequestBody LessonCreationRequest request) {
        return ResponseEntity.ok(ApiResponse.<LessonResponse>builder()
                .code(200)
                .message("Tạo bài học thành công.")
                .result(lessonService.createLesson(request))
                .build());
    }

    // Tất cả người dùng đã đăng nhập đều xem được
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'USER')")
    public ResponseEntity<ApiResponse<List<LessonResponse>>> getAllLessons() {
        return ResponseEntity.ok(ApiResponse.<List<LessonResponse>>builder()
                .result(lessonService.getAllLessons())
                .build());
    }

    @GetMapping("/chapter/{chapterId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'USER')")
    public ResponseEntity<ApiResponse<List<LessonResponse>>> getLessonsByChapterId(@PathVariable Long chapterId) {
        return ResponseEntity.ok(ApiResponse.<List<LessonResponse>>builder()
                .result(lessonService.getLessonsByChapterId(chapterId))
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'USER')")
    public ResponseEntity<ApiResponse<LessonResponse>> getLesson(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<LessonResponse>builder()
                .result(lessonService.getLesson(id))
                .build());
    }

    // ADMIN và TEACHER mới được sửa/xóa bài học
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<LessonResponse>> updateLesson(@PathVariable Long id, @RequestBody LessonUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.<LessonResponse>builder()
                .result(lessonService.updateLesson(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteLesson(@PathVariable Long id) {
        lessonService.deleteLesson(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Xóa bài học thành công.")
                .build());
    }
}
