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

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
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
     * Tìm đơn hàng hiện có (PENDING/FAILED) hoặc tạo mới.
     * Tránh tạo duplicate khi user retry.
     */
    @Transactional
    public PaymentOrder findOrCreateOrder(Long khoahocTransactionId, Long userId,
                                          Double amount, String courseNames, String ref) {
        // Tìm đơn hàng đã tồn tại có thể tái sử dụng
        List<PaymentOrder> existing = paymentOrderRepository.findByKhoahocTransactionId(khoahocTransactionId);
        Optional<PaymentOrder> reusable = existing.stream()
                .filter(o -> "PENDING".equals(o.getStatus()) || "FAILED".equals(o.getStatus()))
                .findFirst();

        if (reusable.isPresent()) {
            PaymentOrder order = reusable.get();
            order.setStatus("PENDING");
            order.setPaymentMethod(null); // Reset để user chọn lại
            log.info("Tái sử dụng đơn hàng gwOrderId={} cho khoahocTxId={}", order.getGwOrderId(), khoahocTransactionId);
            return paymentOrderRepository.save(order);
        }

        // Tạo mới nếu không có đơn nào tái sử dụng được
        PaymentOrder order = PaymentOrder.builder()
                .khoahocTransactionId(khoahocTransactionId)
                .userId(userId)
                .amount(amount)
                .courseNames(courseNames)
                .status("PENDING")
                .gatewayRef(ref)
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

        // Cho phép retry từ PENDING hoặc FAILED
        if (!"PENDING".equals(order.getStatus()) && !"FAILED".equals(order.getStatus())) {
            throw new RuntimeException("Đơn hàng đã được xử lý, trạng thái hiện tại: " + order.getStatus());
        }

        order.setPaymentMethod(paymentMethod);
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

        // Chống finalize lại đơn đã hoàn tất → tránh gửi webhook 2 lần (double-spend)
        if ("SUCCESS".equals(order.getStatus()) || "CANCELLED".equals(order.getStatus())) {
            log.warn("Đơn hàng {} đã ở trạng thái {}. Bỏ qua finalize.", gwOrderId, order.getStatus());
            return order;
        }

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

        // Chống cancel lại đơn đã hoàn tất
        if ("SUCCESS".equals(order.getStatus()) || "CANCELLED".equals(order.getStatus())) {
            log.warn("Đơn hàng {} đã ở trạng thái {}. Bỏ qua cancel.", gwOrderId, order.getStatus());
            return order;
        }

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
        String timestamp = String.valueOf(Instant.now().toEpochMilli());
        String nonce = UUID.randomUUID().toString();
        BigDecimal amount = BigDecimal.valueOf(order.getAmount());
        
        // Cổng 8090 dùng khoahocTransactionId làm orderId
        Long orderId = order.getKhoahocTransactionId();
        Long userId = order.getUserId();
        // Cổng 8080 mong đợi transactionRef gốc (thường là TXN-...) hoặc ref của Gateway. 
        // Trong trường hợp này, mình gửi lại gatewayRef để nó báo lỗi (nếu LMS chưa map) 
        // hoặc gửi kèm khoahocTransactionId để LMS tìm.
        // Tạm thời mình map GatewayRef vào TransactionRef của LMS.
        String transactionRef = order.getGatewayRef(); 

        WebhookCallbackRequest payload = WebhookCallbackRequest.builder()
                .transactionRef(transactionRef)
                .orderId(orderId)
                .userId(userId)
                .amount(amount)
                .status(status)
                .timestamp(timestamp)
                .nonce(nonce)
                .build();

        // 1. Tạo chuỗi Payload để mã hóa (Giống hệt bên LMS)
        String payloadString = transactionRef + "|" +
                orderId + "|" +
                userId + "|" +
                amount.setScale(2, RoundingMode.HALF_UP).toPlainString() + "|" +
                status + "|" +
                timestamp + "|" +
                nonce;

        // 2. Ký HMAC-SHA256
        String signature = generateHmacSHA256(payloadString, secretKey);

        try {
            khoahocWebClient.post()
                    .uri(khoahocWebhookUrl)
                    .header("X-Api-Key", apiKey)
                    .header("X-Signature", signature) // Gửi chữ ký thay vì secretKey
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(String.class)
                    .subscribe(
                            response -> log.info("Webhook gửi về KhoaHoc thành công. Ref={}, Status={}, Response={}",
                                    transactionRef, status, response),
                            error -> log.error("LỖI gọi webhook về KhoaHoc. Ref={}, Error={}",
                                    transactionRef, error.getMessage())
                    );
        } catch (Exception e) {
            log.error("LỖI khi setup webhook về KhoaHoc. Ref={}, Error={}",
                    transactionRef, e.getMessage());
        }
    }

    private String generateHmacSHA256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hmacBytes);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tạo chữ ký HMAC", e);
        }
    }
}
