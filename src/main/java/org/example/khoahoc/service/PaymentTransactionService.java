package org.example.khoahoc.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.dto.request.GatewayInitiateRequest;
import org.example.khoahoc.dto.request.PaymentTransactionCreationRequest;
import org.example.khoahoc.dto.request.PaymentTransactionUpdateRequest;
import org.example.khoahoc.dto.response.PaymentTransactionResponse;
import org.example.khoahoc.entity.Course;
import org.example.khoahoc.entity.PaymentTransaction;
import org.example.khoahoc.entity.TransactionItem;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.mapper.PaymentTransactionMapper;
import org.example.khoahoc.repository.CourseRepository;
import org.example.khoahoc.repository.PaymentTransactionRepository;
import org.example.khoahoc.repository.TransactionItemRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class PaymentTransactionService {

    final PaymentTransactionRepository paymentTransactionRepository;
    final PaymentTransactionMapper paymentTransactionMapper;
    final PaymentSignatureService paymentSignatureService;
    final TransactionItemRepository transactionItemRepository;
    final CourseRepository courseRepository;

    @Value("${payment.gateway.url:http://localhost:8090}")
    String paymentGatewayUrl;

    @Value("${payment.gateway.return-url:http://localhost:8080/payment/return}")
    String returnUrl;

    @Value("${payment.webhook.callback-url:http://localhost:8080/api/webhook/payment}")
    String ipnUrl;

    @Value("${payment.merchant.api-key:LMS_API_KEY}")
    String merchantApiKey;

    @Value("${payment.webhook.secret-key:SHARED_HMAC_SECRET_2024}")
    String gatewaySecretKey;

    public PaymentTransactionResponse createTransaction(PaymentTransactionCreationRequest request) {
        log.info("Tạo giao dịch mới cho orderId: {}, courseId: {}", request.getOrderId(), request.getCourseId());

        // 1. Lấy thông tin khóa học và giá tiền (courseId bắt buộc)
        if (request.getCourseId() == null) {
            throw new AppException(ErrorCode.COURSE_NOT_FOUND);
        }
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        Double coursePrice = course.getPrice();
        if (coursePrice == null || coursePrice <= 0) {
            throw new RuntimeException("Khóa học [" + course.getTitle() + "] chưa có giá hợp lệ");
        }

        // 2. Tạo transactionRef duy nhất để link giữa LMS và Gateway
        String transactionRef = "TXN_" + UUID.randomUUID().toString()
                .replace("-", "").substring(0, 12).toUpperCase();
        String timestamp = String.valueOf(System.currentTimeMillis());
        String nonce = UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        // 3. Lưu giao dịch với giá lấy từ Course.price
        PaymentTransaction transaction = paymentTransactionMapper.toPaymentTransaction(request);
        transaction.setTransactionRef(transactionRef);
        transaction.setAmount(coursePrice);
        transaction = paymentTransactionRepository.save(transaction);

        // 4. tạo TransactionItem gắn khóa học vào đơn hàng
        TransactionItem item = TransactionItem.builder()
                .transactionId(transaction.getTransactionId())
                .courseId(course.getCourseId())
                .amount(coursePrice)
                .build();
        transactionItemRepository.save(item);
        log.info("Tạo TransactionItem - transactionId: {}, courseId: {}, tên: [{}], giá: {}",
                transaction.getTransactionId(), course.getCourseId(), course.getTitle(), coursePrice);

        PaymentTransactionResponse response = paymentTransactionMapper.toPaymentTransactionResponse(transaction);

        // 5. Gọi Gateway API để khởi tạo phiên thanh toán
        try {
            BigDecimal amount = BigDecimal.valueOf(coursePrice).setScale(2, RoundingMode.HALF_UP);

            // Build payload for Gateway verify
            String payload = transactionRef + "|" +
                    transaction.getOrderId() + "|" +
                    transaction.getUserId() + "|" +
                    amount.toPlainString() + "|" +
                    returnUrl + "|" +
                    ipnUrl + "|" +
                    timestamp + "|" +
                    nonce;
            String signature = paymentSignatureService.sign(payload, gatewaySecretKey);

            GatewayInitiateRequest gatewayRequest = GatewayInitiateRequest.builder()
                    .transactionRef(transactionRef)
                    .orderId(transaction.getOrderId())
                    .userId(transaction.getUserId())
                    .amount(amount)
                    .returnUrl(returnUrl)
                    .ipnUrl(ipnUrl)
                    .timestamp(timestamp)
                    .nonce(nonce)
                    .build();

            // Gọi Gateway với 2 header bảo mật
            Map<?, ?> gatewayResponse = RestClient.create()
                    .post()
                    .uri(paymentGatewayUrl + "/gateway/payments/initiate")
                    .header("X-Api-Key", merchantApiKey)
                    .header("X-Signature", signature)
                    .body(gatewayRequest)
                    .retrieve()
                    .body(Map.class);

            // Lấy paymentUrl từ Gateway để trả về cho client redirect
            if (gatewayResponse != null && gatewayResponse.get("paymentUrl") != null) {
                response.setGatewayUrl(gatewayResponse.get("paymentUrl").toString());
                log.info("Gateway URL cho transactionRef [{}]: {}", transactionRef, response.getGatewayUrl());
            }

        } catch (Exception e) {
            log.warn("Không thể gọi Gateway (transactionRef: {}): {}. " +
                    "Giao dịch vẫn được tạo với status PENDING.", transactionRef, e.getMessage());
        }

        return response;
    }

    public PaymentTransactionResponse getTransaction(Long id) {
        PaymentTransaction transaction = paymentTransactionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND));
        return paymentTransactionMapper.toPaymentTransactionResponse(transaction);
    }

    public List<PaymentTransactionResponse> getAllTransactions() {
        return paymentTransactionMapper.toPaymentTransactionResponseList(paymentTransactionRepository.findAll());
    }

    public List<PaymentTransactionResponse> getTransactionsByOrderId(Long orderId) {
        return paymentTransactionMapper.toPaymentTransactionResponseList(
                paymentTransactionRepository.findByOrderId(orderId));
    }

    public PaymentTransactionResponse updateTransaction(Long id, PaymentTransactionUpdateRequest request) {
        PaymentTransaction transaction = paymentTransactionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND));
        paymentTransactionMapper.updatePaymentTransaction(transaction, request);
        transaction = paymentTransactionRepository.save(transaction);
        return paymentTransactionMapper.toPaymentTransactionResponse(transaction);
    }

    public void deleteTransaction(Long id) {
        PaymentTransaction transaction = paymentTransactionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND));
        paymentTransactionRepository.delete(transaction);
    }
}
