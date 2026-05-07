package org.example.khoahoc.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.khoahoc.dto.request.TransactionItemCreationRequest;
import org.example.khoahoc.dto.request.TransactionItemUpdateRequest;
import org.example.khoahoc.dto.response.ApiResponse;
import org.example.khoahoc.dto.response.TransactionItemResponse;
import org.example.khoahoc.service.TransactionItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transaction-items")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TransactionItemController {

    TransactionItemService transactionItemService;

    // USER tạo mục giao dịch (các khóa học trong đơn), ADMIN cũng có thể
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<TransactionItemResponse>> createTransactionItem(@RequestBody TransactionItemCreationRequest request) {
        ApiResponse<TransactionItemResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Tạo mục giao dịch thành công.");
        response.setResult(transactionItemService.createTransactionItem(request));
        return ResponseEntity.ok(response);
    }

    // Chỉ ADMIN xem toàn bộ
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TransactionItemResponse>>> getAllTransactionItems() {
        ApiResponse<List<TransactionItemResponse>> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(transactionItemService.getAllTransactionItems());
        return ResponseEntity.ok(response);
    }

    // USER/ADMIN xem mục giao dịch theo transactionId
    @GetMapping("/transaction/{transactionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<List<TransactionItemResponse>>> getTransactionItemsByTransactionId(@PathVariable Long transactionId) {
        ApiResponse<List<TransactionItemResponse>> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(transactionItemService.getTransactionItemsByTransactionId(transactionId));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<TransactionItemResponse>> getTransactionItem(@PathVariable Long id) {
        ApiResponse<TransactionItemResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(transactionItemService.getTransactionItem(id));
        return ResponseEntity.ok(response);
    }

    // Chỉ ADMIN mới được sửa/xóa mục giao dịch
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TransactionItemResponse>> updateTransactionItem(@PathVariable Long id, @RequestBody TransactionItemUpdateRequest request) {
        ApiResponse<TransactionItemResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(transactionItemService.updateTransactionItem(id, request));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTransactionItem(@PathVariable Long id) {
        transactionItemService.deleteTransactionItem(id);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Xóa mục giao dịch thành công.");
        return ResponseEntity.ok(response);
    }
}
