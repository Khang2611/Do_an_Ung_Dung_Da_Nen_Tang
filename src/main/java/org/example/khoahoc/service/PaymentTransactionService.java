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
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.example.khoahoc.dto.request.EnrollmentCreationRequest;
import org.example.khoahoc.dto.request.WebhookCallbackRequest;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.annotation.Transactional;

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
    final EnrollmentService enrollmentService;
    final PlatformTransactionManager transactionManager;

    @Value("${payment.gateway.url:http://localhost:8090}")
    String paymentGatewayUrl;

    @Value("${payment.gateway.return-url:http://localhost:5173/payment/return}")
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

        TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
        final PaymentTransaction finalTransaction = transaction;
        PaymentTransaction savedTransaction = transactionTemplate.execute(status -> {
            PaymentTransaction tx = paymentTransactionRepository.save(finalTransaction);
            // 4. Tự động tạo TransactionItem gắn khóa học vào đơn hàng
            TransactionItem item = TransactionItem.builder()
                    .transactionId(tx.getTransactionId())
                    .courseId(course.getCourseId())
                    .amount(coursePrice)
                    .build();
            transactionItemRepository.save(item);
            log.info("Tạo TransactionItem - transactionId: {}, courseId: {}, tên: [{}], giá: {}",
                    tx.getTransactionId(), course.getCourseId(), course.getTitle(), coursePrice);
            return tx;
        });

        PaymentTransactionResponse response = paymentTransactionMapper.toPaymentTransactionResponse(savedTransaction);

        // 5. Gọi Gateway API để khởi tạo phiên thanh toán
        try {
            BigDecimal amount = BigDecimal.valueOf(coursePrice).setScale(2, RoundingMode.HALF_UP);
            String transactionReturnUrl = appendReturnParams(returnUrl, request.getCourseId(), transaction.getTransactionId(), transactionRef);

            // Build payload theo đúng thứ tự mà Gateway verify (khớp với GatewayPaymentController.buildPayload)
            String payload = transactionRef + "|" +
                    transaction.getOrderId() + "|" +
                    transaction.getUserId() + "|" +
                    amount.toPlainString() + "|" +
                    transactionReturnUrl + "|" +
                    ipnUrl + "|" +
                    timestamp + "|" +
                    nonce;
            String signature = paymentSignatureService.sign(payload, gatewaySecretKey);

            GatewayInitiateRequest gatewayRequest = GatewayInitiateRequest.builder()
                    .transactionRef(transactionRef)
                    .orderId(transaction.getOrderId())
                    .userId(transaction.getUserId())
                    .amount(amount)
                    .returnUrl(transactionReturnUrl)
                    .ipnUrl(ipnUrl)
                    .timestamp(timestamp)
                    .nonce(nonce)
                    .build();

            // Gọi Gateway với 2 header bảo mật (X-Api-Key là định danh Merchant, X-Signature là chữ ký)
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

    private String appendReturnParams(String baseUrl, Long courseId, Long transactionId, String transactionRef) {
        String separator = baseUrl.contains("?") ? "&" : "?";
        return baseUrl + separator +
                "courseId=" + encode(String.valueOf(courseId)) +
                "&transactionId=" + encode(String.valueOf(transactionId)) +
                "&transactionRef=" + encode(transactionRef);
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
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

    @Transactional
    public void processPaymentWebhook(WebhookCallbackRequest request) {
        log.info("Xử lý webhook thanh toán trong Transaction - transactionRef: {}, status: {}",
                request.getTransactionRef(), request.getStatus());

        // 1. Tìm giao dịch trong DB bằng transactionRef
        PaymentTransaction transaction = paymentTransactionRepository
                .findByTransactionRef(request.getTransactionRef())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND));

        // 2. Cập nhật trạng thái giao dịch
        PaymentTransactionUpdateRequest updateRequest = PaymentTransactionUpdateRequest.builder()
                .status(request.getStatus())
                .transactionRef(request.getTransactionRef())
                .build();
        paymentTransactionMapper.updatePaymentTransaction(transaction, updateRequest);
        paymentTransactionRepository.save(transaction);

        // 3. Nếu SUCCESS → tạo Enrollment cho từng khóa học trong giao dịch
        if ("SUCCESS".equalsIgnoreCase(request.getStatus())) {
            List<TransactionItem> items = transactionItemRepository
                    .findByTransactionId(transaction.getTransactionId());

            if (items.isEmpty()) {
                log.warn("Không tìm thấy TransactionItem cho transactionId: {}. Cần tạo TransactionItem trước khi thanh toán.", transaction.getTransactionId());
            }

            for (TransactionItem item : items) {
                try {
                    EnrollmentCreationRequest enrollmentRequest = EnrollmentCreationRequest.builder()
                            .userId(transaction.getUserId())
                            .courseId(item.getCourseId())
                            .build();
                    enrollmentService.createEnrollment(enrollmentRequest);
                    log.info("Tạo Enrollment thành công - UserId: {}, CourseId: {}",
                            transaction.getUserId(), item.getCourseId());
                } catch (AppException e) {
                    if (e.getErrorCode() == ErrorCode.ENROLLMENT_EXISTED) {
                        // Webhook có thể retry nhiều lần — bỏ qua nếu đã có (idempotent)
                        log.warn("Enrollment đã tồn tại (idempotent OK) - UserId: {}, CourseId: {}",
                                transaction.getUserId(), item.getCourseId());
                    } else {
                        throw e;
                    }
                }
            }
        }
    }
}
