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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

@RestController
@RequestMapping("/api/payment-transactions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentTransactionController {

    PaymentTransactionService paymentTransactionService;

    // USER tạo giao dịch thanh toán khi mua khóa học, ADMIN cũng có thể tạo
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<PaymentTransactionResponse>> createTransaction(
            @RequestBody PaymentTransactionCreationRequest request,
            HttpServletRequest httpRequest) {

        // Lấy IP Address từ request
        String ipAddress = httpRequest.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = httpRequest.getRemoteAddr();
        }
        request.setIpAddress(ipAddress);

        ApiResponse<PaymentTransactionResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Tạo giao dịch thanh toán thành công.");
        response.setResult(paymentTransactionService.createTransaction(request));
        return ResponseEntity.ok(response);
    }

    // Chỉ ADMIN xem toàn bộ giao dịch
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentTransactionResponse>>> getAllTransactions() {
        ApiResponse<List<PaymentTransactionResponse>> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(paymentTransactionService.getAllTransactions());
        return ResponseEntity.ok(response);
    }

    // ADMIN xem giao dịch theo orderId
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentTransactionResponse>>> getTransactionsByOrderId(
            @PathVariable Long orderId) {
        ApiResponse<List<PaymentTransactionResponse>> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(paymentTransactionService.getTransactionsByOrderId(orderId));
        return ResponseEntity.ok(response);
    }

    // USER/ADMIN xem giao dịch theo id
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<PaymentTransactionResponse>> getTransaction(@PathVariable Long id) {
        ApiResponse<PaymentTransactionResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(paymentTransactionService.getTransaction(id));
        return ResponseEntity.ok(response);
    }

    // Chỉ ADMIN mới được sửa/xóa giao dịch
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentTransactionResponse>> updateTransaction(@PathVariable Long id,
            @RequestBody PaymentTransactionUpdateRequest request) {
        ApiResponse<PaymentTransactionResponse> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage(org.example.khoahoc.exception.ErrorCode.SUCCESS.getMessage());
        response.setResult(paymentTransactionService.updateTransaction(id, request));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(@PathVariable Long id) {
        paymentTransactionService.deleteTransaction(id);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(org.example.khoahoc.exception.ErrorCode.SUCCESS.getCode());
        response.setMessage("Xóa giao dịch thanh toán thành công.");
        return ResponseEntity.ok(response);
    }
}
