package org.example.khoahoc.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.dto.request.EnrollmentCreationRequest;
import org.example.khoahoc.dto.request.PaymentTransactionUpdateRequest;
import org.example.khoahoc.dto.request.WebhookCallbackRequest;
import org.example.khoahoc.dto.response.PaymentTransactionResponse;
import org.example.khoahoc.entity.TransactionItem;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.repository.TransactionItemRepository;
import org.example.khoahoc.service.EnrollmentService;
import org.example.khoahoc.service.PaymentTransactionService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/webhook")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class PaymentWebhookController {

    final PaymentTransactionService paymentTransactionService;
    final TransactionItemRepository transactionItemRepository; // Lấy danh sách khóa học trong hóa đơn
    final EnrollmentService enrollmentService;

    @Value("${payment.webhook.api-key}")
    String apiKey;

    @Value("${payment.webhook.secret-key}")
    String secretKey;

    /**
     * Webhook nhận callback từ hệ thống thanh toán thứ 3.
     * Cần check header X-Api-Key và X-Secret-Key.
     */
    @PostMapping("/payment")
    public ResponseEntity<String> handlePaymentWebhook(
            @RequestHeader(value = "X-Api-Key", required = false) String requestApiKey,
            @RequestHeader(value = "X-Secret-Key", required = false) String requestSecretKey,
            @RequestBody WebhookCallbackRequest request) {

        log.info("Nhận webhook callback cho transactionId: {}, status: {}", request.getTransactionId(), request.getStatus());

        // 1. Xác thực 2 keys đồng nhất
        if (requestApiKey == null || requestSecretKey == null ||
                !requestApiKey.equals(apiKey) || !requestSecretKey.equals(secretKey)) {
            log.warn("Xác thực webhook thất bại - Keys không hợp lệ hoặc bị thiếu");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Authentication Keys");
        }

        try {
            // 2. Chuyển đổi trạng thái Transaction
            PaymentTransactionUpdateRequest updateRequest = PaymentTransactionUpdateRequest.builder()
                    .status(request.getStatus())
                    .transactionRef(request.getTransactionRef())
                    .build();
            PaymentTransactionResponse updatedTransaction = paymentTransactionService.updateTransaction(
                    request.getTransactionId(), updateRequest
            );

            // 3. Nếu SUCCESS -> Thực hiện tạo Enrollment cho các khóa học tương ứng
            if ("SUCCESS".equalsIgnoreCase(request.getStatus())) {
                List<TransactionItem> items = transactionItemRepository.findByTransactionId(request.getTransactionId());
                for (TransactionItem item : items) {
                    EnrollmentCreationRequest enrollmentRequest = EnrollmentCreationRequest.builder()
                            .userId(updatedTransaction.getUserId())
                            .courseId(item.getCourseId())
                            .build();
                    enrollmentService.createEnrollment(enrollmentRequest);
                    log.info("Tạo thành công Enrollment - UserId: {}, CourseId: {}", updatedTransaction.getUserId(), item.getCourseId());
                }
            }

            return ResponseEntity.ok("Webhook xử lý thành công");

        } catch (AppException e) {
            log.error("Lỗi khi xử lý transaction (TransactionId: {}): {}", request.getTransactionId(), e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            log.error("Lỗi hệ thống khi xử lý webhook: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi xử lý nội bộ");
        }
    }
}
