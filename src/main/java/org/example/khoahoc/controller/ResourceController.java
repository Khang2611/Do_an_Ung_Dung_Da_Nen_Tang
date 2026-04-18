package org.example.khoahoc.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.khoahoc.dto.request.ResourceCreationRequest;
import org.example.khoahoc.dto.request.ResourceUpdateRequest;
import org.example.khoahoc.dto.response.ApiResponse;
import org.example.khoahoc.dto.response.ResourceResponse;
import org.example.khoahoc.service.ResourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ResourceController {

    ResourceService resourceService;

    // ADMIN và TEACHER mới được thêm tài liệu
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<ResourceResponse>> createResource(@RequestBody ResourceCreationRequest request) {
        return ResponseEntity.ok(ApiResponse.<ResourceResponse>builder()
                .code(200)
                .message("Tạo tài liệu thành công.")
                .result(resourceService.createResource(request))
                .build());
    }

    // Tất cả người dùng đã đăng nhập đều xem được tài liệu
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'USER')")
    public ResponseEntity<ApiResponse<List<ResourceResponse>>> getAllResources() {
        return ResponseEntity.ok(ApiResponse.<List<ResourceResponse>>builder()
                .result(resourceService.getAllResources())
                .build());
    }

    @GetMapping("/lesson/{lessonId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'USER')")
    public ResponseEntity<ApiResponse<List<ResourceResponse>>> getResourcesByLessonId(@PathVariable Long lessonId) {
        return ResponseEntity.ok(ApiResponse.<List<ResourceResponse>>builder()
                .result(resourceService.getResourcesByLessonId(lessonId))
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'USER')")
    public ResponseEntity<ApiResponse<ResourceResponse>> getResource(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<ResourceResponse>builder()
                .result(resourceService.getResource(id))
                .build());
    }

    // ADMIN và TEACHER mới được sửa/xóa tài liệu
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<ResourceResponse>> updateResource(@PathVariable Long id, @RequestBody ResourceUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.<ResourceResponse>builder()
                .result(resourceService.updateResource(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Xóa tài liệu thành công.")
                .build());
    }
}
