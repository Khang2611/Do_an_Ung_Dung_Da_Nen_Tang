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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chapters")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChapterController {

    ChapterService chapterService;

    @PostMapping
    public ResponseEntity<ApiResponse<ChapterResponse>> createChapter(@RequestBody ChapterCreationRequest request) {
        ChapterResponse response = chapterService.createChapter(request);
        
        ApiResponse<ChapterResponse> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Tạo chương học thành công.");
        apiResponse.setResult(response);
        
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ChapterResponse>>> getAllChapters() {
        ApiResponse<List<ChapterResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(chapterService.getAllChapters());
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<ChapterResponse>>> getChaptersByCourseId(@PathVariable Long courseId) {
        ApiResponse<List<ChapterResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(chapterService.getChaptersByCourseId(courseId));
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ChapterResponse>> getChapter(@PathVariable Long id) {
        ApiResponse<ChapterResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(chapterService.getChapter(id));
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ChapterResponse>> updateChapter(@PathVariable Long id, @RequestBody ChapterUpdateRequest request) {
        ApiResponse<ChapterResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(chapterService.updateChapter(id, request));
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteChapter(@PathVariable Long id) {
        chapterService.deleteChapter(id);
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Xóa chương học thành công.");
        return ResponseEntity.ok(apiResponse);
    }
}
