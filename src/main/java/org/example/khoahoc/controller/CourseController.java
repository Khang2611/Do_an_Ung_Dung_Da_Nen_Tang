package org.example.khoahoc.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.khoahoc.dto.request.CourseCreationRequest;
import org.example.khoahoc.dto.request.CourseUpdateRequest;
import org.example.khoahoc.dto.response.ApiResponse;
import org.example.khoahoc.dto.response.CourseResponse;
import org.example.khoahoc.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CourseController {

    CourseService courseService;

    // ADMIN , TEACHER mới được tạo khóa học
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(@RequestBody CourseCreationRequest request) {
        return ResponseEntity.ok(ApiResponse.<CourseResponse>builder()
                .code(200)
                .message("Tạo khóa học thành công.")
                .result(courseService.createCourse(request))
                .build());
    }

    // Tất cả người dùng đã đăng nhập đều xem được khóa học
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'USER')")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getAllCourses() {
        return ResponseEntity.ok(ApiResponse.<List<CourseResponse>>builder()
                .result(courseService.getAllCourses())
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'USER')")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourse(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<CourseResponse>builder()
                .result(courseService.getCourse(id))
                .build());
    }

    // ADMIN , TEACHER mới được sửa/xóa khóa học
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(@PathVariable Long id,
            @RequestBody CourseUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.<CourseResponse>builder()
                .result(courseService.updateCourse(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Xóa khóa học thành công.")
                .build());
    }
}
