package org.example.khoahoc.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.khoahoc.dto.request.PaymentTransactionCreationRequest;
import org.example.khoahoc.dto.request.PaymentTransactionUpdateRequest;
import org.example.khoahoc.dto.response.ApiResponse;
import org.example.khoahoc.dto.response.PaymentTransactionResponse;
import org.example.khoahoc.service.PaymentTransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment-transactions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentTransactionController {

    PaymentTransactionService paymentTransactionService;

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentTransactionResponse>> createTransaction(@RequestBody PaymentTransactionCreationRequest request) {
        PaymentTransactionResponse response = paymentTransactionService.createTransaction(request);
        
        ApiResponse<PaymentTransactionResponse> apiResponse = new ApiResponse<>();
        apiResponse.setCode(200);
        apiResponse.setMessage("Tạo giao dịch thanh toán thành công.");
        apiResponse.setResult(response);
        
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentTransactionResponse>>> getAllTransactions() {
        ApiResponse<List<PaymentTransactionResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(paymentTransactionService.getAllTransactions());
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<List<PaymentTransactionResponse>>> getTransactionsByOrderId(@PathVariable Long orderId) {
        ApiResponse<List<PaymentTransactionResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(paymentTransactionService.getTransactionsByOrderId(orderId));
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentTransactionResponse>> getTransaction(@PathVariable Long id) {
        ApiResponse<PaymentTransactionResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(paymentTransactionService.getTransaction(id));
        return ResponseEntity.ok(apiResponse);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentTransactionResponse>> updateTransaction(@PathVariable Long id, @RequestBody PaymentTransactionUpdateRequest request) {
        ApiResponse<PaymentTransactionResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(paymentTransactionService.updateTransaction(id, request));
        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(@PathVariable Long id) {
        paymentTransactionService.deleteTransaction(id);
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("Xóa giao dịch thanh toán thành công.");
        return ResponseEntity.ok(apiResponse);
    }
}
