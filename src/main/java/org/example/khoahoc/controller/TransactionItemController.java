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
        return ResponseEntity.ok(ApiResponse.<TransactionItemResponse>builder()
                .code(200)
                .message("Tạo mục giao dịch thành công.")
                .result(transactionItemService.createTransactionItem(request))
                .build());
    }

    // Chỉ ADMIN xem toàn bộ
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TransactionItemResponse>>> getAllTransactionItems() {
        return ResponseEntity.ok(ApiResponse.<List<TransactionItemResponse>>builder()
                .result(transactionItemService.getAllTransactionItems())
                .build());
    }

    // USER/ADMIN xem mục giao dịch theo transactionId
    @GetMapping("/transaction/{transactionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<List<TransactionItemResponse>>> getTransactionItemsByTransactionId(@PathVariable Long transactionId) {
        return ResponseEntity.ok(ApiResponse.<List<TransactionItemResponse>>builder()
                .result(transactionItemService.getTransactionItemsByTransactionId(transactionId))
                .build());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<TransactionItemResponse>> getTransactionItem(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<TransactionItemResponse>builder()
                .result(transactionItemService.getTransactionItem(id))
                .build());
    }

    // Chỉ ADMIN mới được sửa/xóa mục giao dịch
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TransactionItemResponse>> updateTransactionItem(@PathVariable Long id, @RequestBody TransactionItemUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.<TransactionItemResponse>builder()
                .result(transactionItemService.updateTransactionItem(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTransactionItem(@PathVariable Long id) {
        transactionItemService.deleteTransactionItem(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Xóa mục giao dịch thành công.")
                .build());
    }
}
