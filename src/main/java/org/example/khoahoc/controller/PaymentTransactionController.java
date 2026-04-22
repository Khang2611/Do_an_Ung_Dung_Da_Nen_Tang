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

        return ResponseEntity.ok(ApiResponse.<PaymentTransactionResponse>builder()
                .code(200)
                .message("Tạo giao dịch thanh toán thành công.")
                .result(paymentTransactionService.createTransaction(request))
                .build());
    }

    // Chỉ ADMIN xem toàn bộ giao dịch
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentTransactionResponse>>> getAllTransactions() {
        return ResponseEntity.ok(ApiResponse.<List<PaymentTransactionResponse>>builder()
                .result(paymentTransactionService.getAllTransactions())
                .build());
    }

    // ADMIN xem giao dịch theo orderId
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentTransactionResponse>>> getTransactionsByOrderId(
            @PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.<List<PaymentTransactionResponse>>builder()
                .result(paymentTransactionService.getTransactionsByOrderId(orderId))
                .build());
    }

    // USER/ADMIN xem giao dịch theo id
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ApiResponse<PaymentTransactionResponse>> getTransaction(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.<PaymentTransactionResponse>builder()
                .result(paymentTransactionService.getTransaction(id))
                .build());
    }

    // Chỉ ADMIN mới được sửa/xóa giao dịch
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentTransactionResponse>> updateTransaction(@PathVariable Long id,
            @RequestBody PaymentTransactionUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.<PaymentTransactionResponse>builder()
                .result(paymentTransactionService.updateTransaction(id, request))
                .build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(@PathVariable Long id) {
        paymentTransactionService.deleteTransaction(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Xóa giao dịch thanh toán thành công.")
                .build());
    }
}
