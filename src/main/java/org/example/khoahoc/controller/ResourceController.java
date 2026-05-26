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
        ApiResponse<ResourceResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Tạo tài liệu thành công.");
        response.setResult(resourceService.createResource(request));
        return ResponseEntity.ok(response);
    }

    // Tất cả người dùng đã đăng nhập đều xem được tài liệu
    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<List<ResourceResponse>>> getAllResources() {
        ApiResponse<List<ResourceResponse>> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(resourceService.getAllResources());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/lesson/{lessonId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<List<ResourceResponse>>> getResourcesByLessonId(@PathVariable Long lessonId) {
        ApiResponse<List<ResourceResponse>> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(resourceService.getResourcesByLessonId(lessonId));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<ResourceResponse>> getResource(@PathVariable Long id) {
        ApiResponse<ResourceResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(resourceService.getResource(id));
        return ResponseEntity.ok(response);
    }

    // ADMIN và TEACHER mới được sửa/xóa tài liệu
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<ResourceResponse>> updateResource(@PathVariable Long id, @RequestBody ResourceUpdateRequest request) {
        ApiResponse<ResourceResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(resourceService.updateResource(id, request));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Xóa tài liệu thành công.");
        return ResponseEntity.ok(response);
    }
}
