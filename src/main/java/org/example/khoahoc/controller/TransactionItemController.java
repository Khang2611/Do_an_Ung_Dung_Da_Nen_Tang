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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transaction-items")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TransactionItemController {

    TransactionItemService transactionItemService;

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionItemResponse>> createTransactionItem(@RequestBody TransactionItemCreationRequest request) {
        TransactionItemResponse response = transactionItemService.createTransactionItem(request);
        
        ApiResponse<TransactionItemResponse> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Tạo mục giao dịch thành công.");
        apiResponse.setResult(response);
        
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TransactionItemResponse>>> getAllTransactionItems() {
        ApiResponse<List<TransactionItemResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(transactionItemService.getAllTransactionItems());
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<ApiResponse<List<TransactionItemResponse>>> getTransactionItemsByTransactionId(@PathVariable Long transactionId) {
        ApiResponse<List<TransactionItemResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(transactionItemService.getTransactionItemsByTransactionId(transactionId));
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionItemResponse>> getTransactionItem(@PathVariable Long id) {
        ApiResponse<TransactionItemResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(transactionItemService.getTransactionItem(id));
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionItemResponse>> updateTransactionItem(@PathVariable Long id, @RequestBody TransactionItemUpdateRequest request) {
        ApiResponse<TransactionItemResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(transactionItemService.updateTransactionItem(id, request));
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransactionItem(@PathVariable Long id) {
        transactionItemService.deleteTransactionItem(id);
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Xóa mục giao dịch thành công.");
        return ResponseEntity.ok(apiResponse);
    }
}
