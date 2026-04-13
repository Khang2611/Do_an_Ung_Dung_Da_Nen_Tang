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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ResourceController {

    ResourceService resourceService;

    @PostMapping
    public ResponseEntity<ApiResponse<ResourceResponse>> createResource(@RequestBody ResourceCreationRequest request) {
        ResourceResponse response = resourceService.createResource(request);
        
        ApiResponse<ResourceResponse> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Tạo tài liệu thành công.");
        apiResponse.setResult(response);
        
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResourceResponse>>> getAllResources() {
        ApiResponse<List<ResourceResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(resourceService.getAllResources());
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<ApiResponse<List<ResourceResponse>>> getResourcesByLessonId(@PathVariable Long lessonId) {
        ApiResponse<List<ResourceResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(resourceService.getResourcesByLessonId(lessonId));
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponse>> getResource(@PathVariable Long id) {
        ApiResponse<ResourceResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(resourceService.getResource(id));
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponse>> updateResource(@PathVariable Long id, @RequestBody ResourceUpdateRequest request) {
        ApiResponse<ResourceResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(resourceService.updateResource(id, request));
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Xóa tài liệu thành công.");
        return ResponseEntity.ok(apiResponse);
    }
}
