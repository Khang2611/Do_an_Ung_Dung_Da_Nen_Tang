package org.example.khoahoc.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.khoahoc.dto.request.WebhookCallbackRequest;
import org.example.khoahoc.dto.response.ApiResponse;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.service.PaymentSignatureService;
import org.example.khoahoc.service.PaymentTransactionService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.RoundingMode;

@RestController
@RequestMapping("/api/webhook")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentWebhookController {
    final PaymentTransactionService paymentTransactionService;
    final PaymentSignatureService paymentSignatureService;
    @Value("${payment.webhook.api-key}")
    String apiKey;
    @Value("${payment.webhook.secret-key}")
    String secretKey;

    /**
     * Webhook nhận IPN callback từ Payment Gateway.
     * Xác thực 2 lớp:
     * 1. X-Api-Key : định danh Gateway, so sánh plain-text
     * 2. X-Signature: chữ ký HMAC-SHA256 tái tạo từ payload và verify
     */
    @PostMapping("/payment")
    public ResponseEntity<ApiResponse<String>> handlePaymentWebhook(
            @RequestHeader(value = "X-Api-Key", required = false) String requestApiKey,
            @RequestHeader(value = "X-Signature", required = false) String requestSignature,
            @RequestBody WebhookCallbackRequest request) {
        // 1. Xác thực API Key
        if (requestApiKey == null || !requestApiKey.equals(apiKey)) {
            throw new AppException(ErrorCode.INVALID_API_KEY);
        }
        // 2. Xác thực Signature HMAC-SHA256
        String payload = request.getTransactionRef() + "|" +
                request.getOrderId() + "|" +
                request.getUserId() + "|" +
                request.getAmount().setScale(2, RoundingMode.HALF_UP).toPlainString() + "|" +
                request.getStatus() + "|" +
                request.getTimestamp() + "|" +
                request.getNonce();
        if (requestSignature == null || !paymentSignatureService.verify(payload, requestSignature, secretKey)) {
            throw new AppException(ErrorCode.INVALID_SIGNATURE);
        }
        paymentTransactionService.processPaymentWebhook(request);
        ApiResponse<String> response = new ApiResponse<>();
        response.setCode(ErrorCode.SUCCESS.getCode());
        response.setMessage("Webhook xử lý thành công");
        response.setResult("Success");
        return ResponseEntity.ok(response);
    }
}
