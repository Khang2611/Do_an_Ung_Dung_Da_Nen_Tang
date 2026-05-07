package com.example.paymentgateway.controller;

import com.example.paymentgateway.entity.PaymentOrder;
import com.example.paymentgateway.service.PaymentGatewayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<Map<String, String>> initiatePayment(@RequestBody Map<String, Object> request) {

        // 1. Nhận dữ liệu từ LMS gửi sang
        // LMS gửi: { "transactionRef": "...", "amount": 100.0, "userId": 7, "orderId": 1001, ... }
        String transactionRef = (String) request.get("transactionRef");
        Long userId = Long.valueOf(request.get("userId").toString());
        Double amount = Double.valueOf(request.get("amount").toString());
        Long orderId = Long.valueOf(request.get("orderId").toString());
        String returnUrl = (String) request.get("returnUrl");

        log.info("Nhận yêu cầu khởi tạo từ LMS: Ref={}, Amount={}", transactionRef, amount);

        // 2. Tạo link dẫn đến trang giao diện thanh toán (Portal) của Gateway
        // Kèm theo transactionRef gốc của LMS vào tham số 'ref'
        String paymentUrl = String.format(
                "http://localhost:8090/pay?transactionId=%d&userId=%d&amount=%.2f&returnUrl=%s&ref=%s",
                orderId, userId, amount, returnUrl != null ? returnUrl : "", transactionRef
        );

        // 3. Trả về cho LMS dưới dạng JSON: { "paymentUrl": "..." }
        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
    }
}
