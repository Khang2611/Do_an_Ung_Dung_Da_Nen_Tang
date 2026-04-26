package org.example.khoahoc.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
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

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class PaymentTransactionService {

    final PaymentTransactionRepository paymentTransactionRepository;
    final PaymentTransactionMapper paymentTransactionMapper;

    // ── THÊM MỚI ──────────────────────────────────────────────────────────────
    final TransactionItemRepository transactionItemRepository;
    final CourseRepository courseRepository;

    @Value("${payment.gateway.url:http://localhost:8090}")
    String paymentGatewayUrl;

    @Value("${payment.gateway.return-url:http://localhost:8080}")
    String returnUrl;
    // ──────────────────────────────────────────────────────────────────────────

    public PaymentTransactionResponse createTransaction(PaymentTransactionCreationRequest request) {
        log.info("Creating new payment transaction for orderId: {}", request.getOrderId());

        PaymentTransaction transaction = paymentTransactionMapper.toPaymentTransaction(request);
        transaction = paymentTransactionRepository.save(transaction);

        PaymentTransactionResponse response = paymentTransactionMapper.toPaymentTransactionResponse(transaction);

        // ── THÊM MỚI: build URL redirect sang Gateway ────────────────────────
        String gatewayUrl = buildGatewayUrl(transaction);
        response.setGatewayUrl(gatewayUrl);
        log.info("Gateway URL cho transactionId {}: {}", transaction.getTransactionId(), gatewayUrl);
        // ─────────────────────────────────────────────────────────────────────

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
        return paymentTransactionMapper.toPaymentTransactionResponseList(paymentTransactionRepository.findByOrderId(orderId));
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

    // ── THÊM MỚI ─────────────────────────────────────────────────────────────
    /**
     * Build URL redirect sang Payment Gateway.
     * Cố gắng lấy tên khóa học từ TransactionItem (nếu đã có).
     * Nếu chưa có items thì courseNames để trống, Gateway vẫn hoạt động.
     */
    private String buildGatewayUrl(PaymentTransaction transaction) {
        String courseNames = "";
        try {
            List<TransactionItem> items = transactionItemRepository
                    .findByTransactionId(transaction.getTransactionId());
            if (!items.isEmpty()) {
                courseNames = items.stream()
                        .map(item -> courseRepository.findById(item.getCourseId())
                                .map(Course::getTitle)
                                .orElse("Khóa học #" + item.getCourseId()))
                        .collect(Collectors.joining(", "));
            }
        } catch (Exception e) {
            log.warn("Không thể lấy tên khóa học cho transactionId {}: {}", transaction.getTransactionId(), e.getMessage());
        }

        return paymentGatewayUrl + "/pay"
                + "?transactionId=" + transaction.getTransactionId()
                + "&userId=" + transaction.getUserId()
                + "&amount=" + transaction.getAmount()
                + "&courseNames=" + URLEncoder.encode(courseNames, StandardCharsets.UTF_8)
                + "&returnUrl=" + URLEncoder.encode(returnUrl, StandardCharsets.UTF_8);
    }
    // ─────────────────────────────────────────────────────────────────────────
}
