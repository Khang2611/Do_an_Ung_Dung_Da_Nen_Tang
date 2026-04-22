package org.example.khoahoc.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.khoahoc.dto.request.CategoryCreationRequest;
import org.example.khoahoc.dto.request.CategoryUpdateRequest;
import org.example.khoahoc.dto.response.ApiResponse;
import org.example.khoahoc.dto.response.CategoryResponse;
import org.example.khoahoc.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryController {

    CategoryService categoryService;

    // ADMIN, TEACHER mới được tạo danh mục
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@RequestBody CategoryCreationRequest request) {
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .code(200)
                .message("Tạo danh mục thành công.")
                .result(categoryService.createCategory(request))
                .build());
    }

    // Tất cả người dùng đã đăng nhập đều xem được danh mục
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'USER')")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.<List<CategoryResponse>>builder()
                .result(categoryService.getAllCategories())
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'USER')")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategory(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .result(categoryService.getCategory(id))
                .build());
    }

    // ADMIN , TEACHER mới được cập nhật/xóa danh mục
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN' ,'TEACHER')")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(@PathVariable Long id,
            @RequestBody CategoryUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.<CategoryResponse>builder()
                .result(categoryService.updateCategory(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Xóa danh mục thành công.")
                .build());
    }
}
