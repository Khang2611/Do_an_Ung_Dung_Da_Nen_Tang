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
        ApiResponse<ChapterResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Tạo chương học thành công.");
        response.setResult(chapterService.createChapter(request));
        return ResponseEntity.ok(response);
    }

    // Tất cả người dùng đã đăng nhập đều xem được
    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<List<ChapterResponse>>> getAllChapters() {
        ApiResponse<List<ChapterResponse>> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(chapterService.getAllChapters());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<List<ChapterResponse>>> getChaptersByCourseId(@PathVariable Long courseId) {
        ApiResponse<List<ChapterResponse>> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(chapterService.getChaptersByCourseId(courseId));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<ChapterResponse>> getChapter(@PathVariable Long id) {
        ApiResponse<ChapterResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(chapterService.getChapter(id));
        return ResponseEntity.ok(response);
    }

    // ADMIN và TEACHER mới được sửa/xóa chương
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<ChapterResponse>> updateChapter(@PathVariable Long id, @RequestBody ChapterUpdateRequest request) {
        ApiResponse<ChapterResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(chapterService.updateChapter(id, request));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteChapter(@PathVariable Long id) {
        chapterService.deleteChapter(id);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Xóa chương học thành công.");
        return ResponseEntity.ok(response);
    }
}
