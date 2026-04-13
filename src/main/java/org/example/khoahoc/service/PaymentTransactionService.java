package org.example.khoahoc.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.dto.request.PaymentTransactionCreationRequest;
import org.example.khoahoc.dto.request.PaymentTransactionUpdateRequest;
import org.example.khoahoc.dto.response.PaymentTransactionResponse;
import org.example.khoahoc.entity.PaymentTransaction;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.repository.PaymentTransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PaymentTransactionService {

    PaymentTransactionRepository paymentTransactionRepository;

    public PaymentTransactionResponse createTransaction(PaymentTransactionCreationRequest request) {
        log.info("Creating new payment transaction for orderId: {}", request.getOrderId());

        PaymentTransaction transaction = PaymentTransaction.builder()
                .orderId(request.getOrderId())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .transactionRef(request.getTransactionRef())
                .build();

        transaction = paymentTransactionRepository.save(transaction);
        return mapToResponse(transaction);
    }

    public PaymentTransactionResponse getTransaction(Long id) {
        PaymentTransaction transaction = paymentTransactionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND));
        return mapToResponse(transaction);
    }

    public List<PaymentTransactionResponse> getAllTransactions() {
        return paymentTransactionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<PaymentTransactionResponse> getTransactionsByOrderId(Long orderId) {
        return paymentTransactionRepository.findByOrderId(orderId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PaymentTransactionResponse updateTransaction(Long id, PaymentTransactionUpdateRequest request) {
        PaymentTransaction transaction = paymentTransactionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND));

        if (request.getStatus() != null) transaction.setStatus(request.getStatus());
        if (request.getTransactionRef() != null) transaction.setTransactionRef(request.getTransactionRef());

        transaction = paymentTransactionRepository.save(transaction);
        return mapToResponse(transaction);
    }

    public void deleteTransaction(Long id) {
        PaymentTransaction transaction = paymentTransactionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND));
        paymentTransactionRepository.delete(transaction);
    }

    private PaymentTransactionResponse mapToResponse(PaymentTransaction transaction) {
        return PaymentTransactionResponse.builder()
                .transactionId(transaction.getTransactionId())
                .orderId(transaction.getOrderId())
                .amount(transaction.getAmount())
                .paymentMethod(transaction.getPaymentMethod())
                .transactionRef(transaction.getTransactionRef())
                .status(transaction.getStatus())
                .createdDate(transaction.getCreatedDate())
                .build();
    }
}
