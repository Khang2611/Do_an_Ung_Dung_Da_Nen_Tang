package com.example.paymentgateway.controller;

import com.example.paymentgateway.entity.PaymentOrder;
import com.example.paymentgateway.service.PaymentGatewayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST API thuần cho tích hợp nội bộ / admin tools.
 * Không cần auth — gateway là internal service.
 */
@RestController
@RequestMapping("/api/gateway")
@RequiredArgsConstructor
public class PaymentApiController {

    private final PaymentGatewayService paymentGatewayService;

    /** Lấy toàn bộ đơn hàng */
    @GetMapping("/orders")
    public ResponseEntity<List<PaymentOrder>> getAllOrders() {
        return ResponseEntity.ok(paymentGatewayService.getAllOrders());
    }

    /** Lấy đơn hàng theo ID */
    @GetMapping("/orders/{gwOrderId}")
    public ResponseEntity<PaymentOrder> getOrder(@PathVariable Long gwOrderId) {
        return ResponseEntity.ok(paymentGatewayService.getOrder(gwOrderId));
    }

    /**
     * Finalize thủ công (dùng cho test / admin override).
     * POST /api/gateway/orders/{id}/finalize
     * body: { "success": true/false }
     */
    @PostMapping("/orders/{gwOrderId}/finalize")
    public ResponseEntity<PaymentOrder> finalizeOrder(
            @PathVariable Long gwOrderId,
            @RequestBody Map<String, Boolean> body) {
        boolean success = Boolean.TRUE.equals(body.get("success"));
        return ResponseEntity.ok(paymentGatewayService.finalizePayment(gwOrderId, success));
    }

    /** Cancel thủ công */
    @PostMapping("/orders/{gwOrderId}/cancel")
    public ResponseEntity<PaymentOrder> cancelOrder(@PathVariable Long gwOrderId) {
        return ResponseEntity.ok(paymentGatewayService.cancelOrder(gwOrderId));
    }

    /** Health check */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "PaymentGateway",
                "port", "8090"
        ));
    }
}
