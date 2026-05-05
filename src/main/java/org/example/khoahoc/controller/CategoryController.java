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
        ApiResponse<CategoryResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Tạo danh mục thành công.");
        response.setResult(categoryService.createCategory(request));
        return ResponseEntity.ok(response);
    }

    // Tất cả người dùng đã đăng nhập đều xem được danh mục
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'USER')")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        ApiResponse<List<CategoryResponse>> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(categoryService.getAllCategories());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'USER')")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategory(@PathVariable Long id) {
        ApiResponse<CategoryResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(categoryService.getCategory(id));
        return ResponseEntity.ok(response);
    }

    // ADMIN , TEACHER mới được cập nhật/xóa danh mục
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN' ,'TEACHER')")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(@PathVariable Long id,
            @RequestBody CategoryUpdateRequest request) {
        ApiResponse<CategoryResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(categoryService.updateCategory(id, request));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Xóa danh mục thành công.");
        return ResponseEntity.ok(response);
    }
}
