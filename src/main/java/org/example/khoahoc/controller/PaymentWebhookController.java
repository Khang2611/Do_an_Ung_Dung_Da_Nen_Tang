package org.example.khoahoc.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.dto.request.EnrollmentCreationRequest;
import org.example.khoahoc.dto.request.PaymentTransactionUpdateRequest;
import org.example.khoahoc.dto.request.WebhookCallbackRequest;
import org.example.khoahoc.dto.response.PaymentTransactionResponse;
import org.example.khoahoc.entity.PaymentTransaction;
import org.example.khoahoc.entity.TransactionItem;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.repository.PaymentTransactionRepository;
import org.example.khoahoc.repository.TransactionItemRepository;
import org.example.khoahoc.service.EnrollmentService;
import org.example.khoahoc.service.PaymentSignatureService;
import org.example.khoahoc.service.PaymentTransactionService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.RoundingMode;
import java.util.List;

@RestController
@RequestMapping("/api/webhook")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class PaymentWebhookController {

    final PaymentTransactionService paymentTransactionService;
    final PaymentTransactionRepository paymentTransactionRepository;
    final TransactionItemRepository transactionItemRepository;
    final EnrollmentService enrollmentService;
    final PaymentSignatureService paymentSignatureService;

    @Value("${payment.webhook.api-key}")
    String apiKey;

    @Value("${payment.webhook.secret-key}")
    String secretKey;

    /**
     * Webhook nhận IPN callback từ Payment Gateway.
     * Xác thực 2 lớp:
     *   1. X-Api-Key  : định danh Gateway, so sánh plain-text
     *   2. X-Signature: chữ ký HMAC-SHA256 tái tạo từ payload và verify
     */
    @PostMapping("/payment")
    public ResponseEntity<String> handlePaymentWebhook(
            @RequestHeader(value = "X-Api-Key", required = false) String requestApiKey,
            @RequestHeader(value = "X-Signature", required = false) String requestSignature,
            @RequestBody WebhookCallbackRequest request) {

        log.info("Nhận webhook callback - transactionRef: {}, status: {}",
                request.getTransactionRef(), request.getStatus());

        // 1. Xác thực API Key
        if (requestApiKey == null || !requestApiKey.equals(apiKey)) {
            log.warn("Webhook bị từ chối - API Key không hợp lệ: [{}]", requestApiKey);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid API Key");
        }

        // 2. Xác thực Signature HMAC-SHA256
        // Chuỗi payload phải khớp hoàn toàn với GatewayPaymentService.confirm() bên Gateway
        String payload = request.getTransactionRef() + "|" +
                request.getOrderId() + "|" +
                request.getUserId() + "|" +
                request.getAmount().setScale(2, RoundingMode.HALF_UP).toPlainString() + "|" +
                request.getStatus() + "|" +
                request.getTimestamp() + "|" +
                request.getNonce();

        if (requestSignature == null || !paymentSignatureService.verify(payload, requestSignature, secretKey)) {
            log.warn("Webhook bị từ chối - Signature không hợp lệ. Expected payload: [{}]", payload);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Signature");
        }

        try {
            // 3. Tìm giao dịch trong DB bằng transactionRef (không phải ID)
            PaymentTransaction transaction = paymentTransactionRepository
                    .findByTransactionRef(request.getTransactionRef())
                    .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND));

            // 4. Cập nhật trạng thái giao dịch
            PaymentTransactionUpdateRequest updateRequest = PaymentTransactionUpdateRequest.builder()
                    .status(request.getStatus())
                    .transactionRef(request.getTransactionRef())
                    .build();
            PaymentTransactionResponse updatedTransaction = paymentTransactionService
                    .updateTransaction(transaction.getTransactionId(), updateRequest);

            // 5. Nếu SUCCESS → tạo Enrollment cho từng khóa học trong giao dịch
            if ("SUCCESS".equalsIgnoreCase(request.getStatus())) {
                List<TransactionItem> items = transactionItemRepository
                        .findByTransactionId(transaction.getTransactionId());

                if (items.isEmpty()) {
                    log.warn("Không tìm thấy TransactionItem cho transactionId: {}. " +
                            "Cần tạo TransactionItem trước khi thanh toán.", transaction.getTransactionId());
                }

                for (TransactionItem item : items) {
                    try {
                        EnrollmentCreationRequest enrollmentRequest = EnrollmentCreationRequest.builder()
                                .userId(updatedTransaction.getUserId())
                                .courseId(item.getCourseId())
                                .build();
                        enrollmentService.createEnrollment(enrollmentRequest);
                        log.info("Tạo Enrollment thành công - UserId: {}, CourseId: {}",
                                updatedTransaction.getUserId(), item.getCourseId());
                    } catch (AppException e) {
                        if (e.getErrorCode() == ErrorCode.ENROLLMENT_EXISTED) {
                            // Webhook có thể retry nhiều lần — bỏ qua nếu đã có (idempotent)
                            log.warn("Enrollment đã tồn tại (idempotent OK) - UserId: {}, CourseId: {}",
                                    updatedTransaction.getUserId(), item.getCourseId());
                        } else {
                            throw e;
                        }
                    }
                }
            }

            log.info("Webhook xử lý thành công - transactionRef: {}", request.getTransactionRef());
            return ResponseEntity.ok("Webhook xử lý thành công");

        } catch (AppException e) {
            log.error("Lỗi khi xử lý webhook (transactionRef: {}): {}", request.getTransactionRef(), e.getMessage());
            return ResponseEntity.status(e.getErrorCode().getHttpStatus()).body(e.getMessage());
        } catch (Exception e) {
            log.error("Lỗi hệ thống khi xử lý webhook: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi xử lý nội bộ");
        }
    }
}
