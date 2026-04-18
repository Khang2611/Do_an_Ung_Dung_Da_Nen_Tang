package org.example.khoahoc.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.khoahoc.dto.request.ChapterCreationRequest;
import org.example.khoahoc.dto.request.ChapterUpdateRequest;
import org.example.khoahoc.dto.response.ApiResponse;
import org.example.khoahoc.dto.response.ChapterResponse;
import org.example.khoahoc.service.ChapterService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chapters")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChapterController {

    ChapterService chapterService;

    // ADMIN và TEACHER mới được tạo chương
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<ChapterResponse>> createChapter(@RequestBody ChapterCreationRequest request) {
        return ResponseEntity.ok(ApiResponse.<ChapterResponse>builder()
                .code(200)
                .message("Tạo chương học thành công.")
                .result(chapterService.createChapter(request))
                .build());
    }

    // Tất cả người dùng đã đăng nhập đều xem được
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'USER')")
    public ResponseEntity<ApiResponse<List<ChapterResponse>>> getAllChapters() {
        return ResponseEntity.ok(ApiResponse.<List<ChapterResponse>>builder()
                .result(chapterService.getAllChapters())
                .build());
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'USER')")
    public ResponseEntity<ApiResponse<List<ChapterResponse>>> getChaptersByCourseId(@PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.<List<ChapterResponse>>builder()
                .result(chapterService.getChaptersByCourseId(courseId))
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'USER')")
    public ResponseEntity<ApiResponse<ChapterResponse>> getChapter(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<ChapterResponse>builder()
                .result(chapterService.getChapter(id))
                .build());
    }

    // ADMIN và TEACHER mới được sửa/xóa chương
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<ChapterResponse>> updateChapter(@PathVariable Long id, @RequestBody ChapterUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.<ChapterResponse>builder()
                .result(chapterService.updateChapter(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteChapter(@PathVariable Long id) {
        chapterService.deleteChapter(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Xóa chương học thành công.")
                .build());
    }
}
