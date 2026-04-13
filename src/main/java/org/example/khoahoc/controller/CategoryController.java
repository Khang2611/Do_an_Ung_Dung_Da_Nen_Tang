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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryController {

    CategoryService categoryService;

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@RequestBody CategoryCreationRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        
        ApiResponse<CategoryResponse> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Tạo danh mục thành công.");
        apiResponse.setResult(response);
        
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        ApiResponse<List<CategoryResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(categoryService.getAllCategories());
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategory(@PathVariable Long id) {
        ApiResponse<CategoryResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(categoryService.getCategory(id));
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(@PathVariable Long id, @RequestBody CategoryUpdateRequest request) {
        ApiResponse<CategoryResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(categoryService.updateCategory(id, request));
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Xóa danh mục thành công.");
        return ResponseEntity.ok(apiResponse);
    }
}
