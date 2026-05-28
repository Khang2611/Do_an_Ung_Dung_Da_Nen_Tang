package org.example.khoahoc.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.khoahoc.dto.request.ResourceCreationRequest;
import org.example.khoahoc.dto.request.ResourceUpdateRequest;
import org.example.khoahoc.dto.response.ApiResponse;
import org.example.khoahoc.dto.response.ResourceResponse;
import org.example.khoahoc.service.ResourceService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ResourceController {

    ResourceService resourceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<ResourceResponse>> createResource(@RequestBody ResourceCreationRequest request) {
        ApiResponse<ResourceResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Tao tai lieu thanh cong.");
        response.setResult(resourceService.createResource(request));
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/upload/{lessonId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<ResourceResponse>> uploadResource(
            @PathVariable Long lessonId,
            @RequestParam("file") MultipartFile file) {
        ApiResponse<ResourceResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Tai len tai lieu thanh cong.");
        response.setResult(resourceService.uploadResource(lessonId, file));
        return ResponseEntity.ok(response);
    }

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

    @GetMapping("/{id}/download")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Void> downloadResource(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, URI.create(resourceService.getSignedDownloadUrl(id)).toString())
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<ResourceResponse>> updateResource(
            @PathVariable Long id,
            @RequestBody ResourceUpdateRequest request) {
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
        response.setMessage("Xoa tai lieu thanh cong.");
        return ResponseEntity.ok(response);
    }
}
