package com.example.paymentgateway.controller;

import com.example.paymentgateway.entity.PaymentOrder;
import com.example.paymentgateway.service.PaymentGatewayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Map;

/**
 * REST API thuần cho tích hợp nội bộ / admin tools.
 * Không cần auth — gateway là internal service.
 */
@RestController
@RequestMapping
@RequiredArgsConstructor
@Slf4j
public class PaymentApiController {

    private final PaymentGatewayService paymentGatewayService;

    @Value("${gateway.api-key:LMS_API_KEY}")
    private String gatewayApiKey;

    @Value("${gateway.secret-key:SHARED_HMAC_SECRET_2024}")
    private String gatewaySecretKey;

    /** Lấy toàn bộ đơn hàng */
    @GetMapping("/api/gateway/orders")
    public ResponseEntity<List<PaymentOrder>> getAllOrders() {
        return ResponseEntity.ok(paymentGatewayService.getAllOrders());
    }

    /** Lấy đơn hàng theo ID */
    @GetMapping("/api/gateway/orders/{gwOrderId}")
    public ResponseEntity<PaymentOrder> getOrder(@PathVariable Long gwOrderId) {
        return ResponseEntity.ok(paymentGatewayService.getOrder(gwOrderId));
    }

    /**
     * Finalize thủ công (dùng cho test / admin override).
     * POST /api/gateway/orders/{id}/finalize
     * body: { "success": true/false }
     */
    @PostMapping("/api/gateway/orders/{gwOrderId}/finalize")
    public ResponseEntity<PaymentOrder> finalizeOrder(
            @PathVariable Long gwOrderId,
            @RequestBody Map<String, Boolean> body) {
        boolean success = Boolean.TRUE.equals(body.get("success"));
        return ResponseEntity.ok(paymentGatewayService.finalizePayment(gwOrderId, success));
    }

    /** Cancel thủ công */
    @PostMapping("/api/gateway/orders/{gwOrderId}/cancel")
    public ResponseEntity<PaymentOrder> cancelOrder(@PathVariable Long gwOrderId) {
        return ResponseEntity.ok(paymentGatewayService.cancelOrder(gwOrderId));
    }

    /** Health check */
    @GetMapping("/api/gateway/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "PaymentGateway",
                "port", "8090"
        ));
    }

    /**
     * API Khởi tạo thanh toán - Nhận yêu cầu từ LMS
     * LMS (8080) sẽ gọi vào đây để lấy link thanh toán
     */
    @PostMapping("/gateway/payments/initiate")
    public ResponseEntity<?> initiatePayment(
            @RequestHeader(value = "X-Api-Key", required = false) String apiKey,
            @RequestHeader(value = "X-Signature", required = false) String signature,
            @RequestBody Map<String, Object> request) {

        // 1. Kiểm tra API Key (Lớp bảo vệ 1)
        if (apiKey == null || !apiKey.equals(gatewayApiKey)) {
            log.warn("Từ chối khởi tạo thanh toán - Sai API Key");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid API Key"));
        }

        // 2. Validate & Lấy dữ liệu từ Payload
        if (request.get("transactionRef") == null || request.get("orderId") == null ||
            request.get("userId") == null || request.get("amount") == null ||
            request.get("timestamp") == null || request.get("nonce") == null) {
            log.warn("Từ chối khởi tạo thanh toán - Thiếu trường bắt buộc");
            return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields: transactionRef, orderId, userId, amount, timestamp, nonce"));
        }

        String transactionRef;
        Long orderId;
        Long userId;
        Double amountRaw;
        try {
            transactionRef = request.get("transactionRef").toString();
            orderId = Long.valueOf(request.get("orderId").toString());
            userId = Long.valueOf(request.get("userId").toString());
            amountRaw = Double.valueOf(request.get("amount").toString());
        } catch (NumberFormatException e) {
            log.warn("Từ chối khởi tạo thanh toán - Sai định dạng số: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid number format for orderId, userId, or amount"));
        }
        String returnUrl = request.get("returnUrl") != null ? request.get("returnUrl").toString() : null;
        String ipnUrl = request.get("ipnUrl") != null ? request.get("ipnUrl").toString() : null;
        String timestamp = request.get("timestamp").toString();
        String nonce = request.get("nonce").toString();

        // Format số tiền để khớp chuẩn (2 chữ số thập phân)
        String amountFormatted = String.format(java.util.Locale.US, "%.2f", amountRaw);

        // 3. Tái tạo lại chuỗi Payload giống hệt cấu trúc bên LMS
        // LMS payload: ref|orderId|userId|amount|returnUrl|ipnUrl|timestamp|nonce
        String payloadToVerify = transactionRef + "|" +
                orderId + "|" +
                userId + "|" +
                amountFormatted + "|" +
                returnUrl + "|" +
                ipnUrl + "|" +
                timestamp + "|" +
                nonce;

        // 4. Kiểm tra chữ ký bảo mật (Lớp bảo vệ 2)
        if (signature == null || !verifySignature(payloadToVerify, signature, gatewaySecretKey)) {
            log.warn("Từ chối khởi tạo thanh toán - Sai Signature. Payload mong đợi: [{}]", payloadToVerify);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid Signature"));
        }

        log.info("Xác thực thành công. Nhận yêu cầu khởi tạo từ LMS: Ref={}, Amount={}", transactionRef, amountRaw);

        // 5. Tạo link dẫn đến trang giao diện thanh toán (Portal) của Gateway
        String paymentUrl = String.format(
                "http://localhost:8090/pay?transactionId=%d&userId=%d&amount=%s&returnUrl=%s&ref=%s",
                orderId, userId, amountFormatted, returnUrl != null ? returnUrl : "", transactionRef
        );

        // 6. Trả về cho LMS dưới dạng JSON: { "paymentUrl": "..." }
        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
    }

    /**
     * Hàm tiện ích: Tính toán HMAC-SHA256 để so sánh chữ ký
     */
    private boolean verifySignature(String payload, String providedSignature, String secretKey) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String calculatedSignature = Base64.getEncoder().encodeToString(raw);
            return calculatedSignature.equals(providedSignature);
        } catch (Exception e) {
            log.error("Lỗi khi tính toán chữ ký", e);
            return false;
        }
    }
}
