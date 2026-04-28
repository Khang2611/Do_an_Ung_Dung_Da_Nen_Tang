package com.example.paymentgateway.service;

import com.example.paymentgateway.dto.request.WebhookCallbackRequest;
import com.example.paymentgateway.entity.PaymentOrder;
import com.example.paymentgateway.repository.PaymentOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentGatewayService {

    private final PaymentOrderRepository paymentOrderRepository;
    private final WebClient khoahocWebClient;

    @Value("${khoahoc.webhook.url}")
    private String khoahocWebhookUrl;

    @Value("${khoahoc.webhook.api-key}")
    private String apiKey;

    @Value("${khoahoc.webhook.secret-key}")
    private String secretKey;

    /**
     * Tạo PaymentOrder mới từ thông tin nhận được từ KhoaHoc.
     */
    @Transactional
    public PaymentOrder createOrder(Long khoahocTransactionId, Long userId,
                                    Double amount, String courseNames) {
        PaymentOrder order = PaymentOrder.builder()
                .khoahocTransactionId(khoahocTransactionId)
                .userId(userId)
                .amount(amount)
                .courseNames(courseNames)
                .status("PENDING")
                .build();
        return paymentOrderRepository.save(order);
    }

    /**
     * Xử lý thanh toán: cập nhật method, sinh gatewayRef, chuyển PROCESSING.
     */
    @Transactional
    public PaymentOrder processPayment(Long gwOrderId, String paymentMethod) {
        PaymentOrder order = paymentOrderRepository.findById(gwOrderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + gwOrderId));

        if (!"PENDING".equals(order.getStatus())) {
            throw new RuntimeException("Đơn hàng đã được xử lý, trạng thái hiện tại: " + order.getStatus());
        }

        String gatewayRef = "GW-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        order.setPaymentMethod(paymentMethod);
        order.setGatewayRef(gatewayRef);
        order.setStatus("PROCESSING");
        return paymentOrderRepository.save(order);
    }

    /**
     * Hoàn tất thanh toán (SUCCESS hoặc FAILED).
     * Sau đó gọi webhook về KhoaHoc.
     */
    @Transactional
    public PaymentOrder finalizePayment(Long gwOrderId, boolean success) {
        PaymentOrder order = paymentOrderRepository.findById(gwOrderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + gwOrderId));

        String finalStatus = success ? "SUCCESS" : "FAILED";
        order.setStatus(finalStatus);
        order = paymentOrderRepository.save(order);

        // Gọi webhook về KhoaHoc
        sendWebhookToKhoaHoc(order, finalStatus);

        return order;
    }

    /**
     * Hủy đơn hàng (người dùng bấm "Hủy").
     */
    @Transactional
    public PaymentOrder cancelOrder(Long gwOrderId) {
        PaymentOrder order = paymentOrderRepository.findById(gwOrderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + gwOrderId));

        order.setStatus("CANCELLED");
        order = paymentOrderRepository.save(order);

        // Báo FAILED về KhoaHoc khi hủy
        sendWebhookToKhoaHoc(order, "FAILED");
        return order;
    }

    /**
     * Lấy tất cả đơn hàng (dành cho trang admin portal).
     */
    public List<PaymentOrder> getAllOrders() {
        return paymentOrderRepository.findAllByOrderByCreatedDateDesc();
    }

    public PaymentOrder getOrder(Long gwOrderId) {
        return paymentOrderRepository.findById(gwOrderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng: " + gwOrderId));
    }

    // =========================================================
    // Internal: gọi webhook POST về KhoaHoc :8080
    // =========================================================
    private void sendWebhookToKhoaHoc(PaymentOrder order, String status) {
        WebhookCallbackRequest payload = WebhookCallbackRequest.builder()
                .transactionId(order.getKhoahocTransactionId())
                .transactionRef(order.getGatewayRef())
                .status(status)
                .build();

        try {
            String response = khoahocWebClient.post()
                    .uri(khoahocWebhookUrl)
                    .header("X-Api-Key", apiKey)
                    .header("X-Secret-Key", secretKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("Webhook gửi về KhoaHoc thành công. TransactionId={}, Status={}, Response={}",
                    order.getKhoahocTransactionId(), status, response);

        } catch (Exception e) {
            // Không throw — gateway đã xử lý xong phần mình, lỗi webhook chỉ log lại
            log.error("LỖI gọi webhook về KhoaHoc. TransactionId={}, Error={}",
                    order.getKhoahocTransactionId(), e.getMessage());
        }
    }
}
