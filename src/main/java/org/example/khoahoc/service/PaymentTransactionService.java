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
import org.example.khoahoc.mapper.PaymentTransactionMapper;
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
    PaymentTransactionMapper paymentTransactionMapper;

    public PaymentTransactionResponse createTransaction(PaymentTransactionCreationRequest request) {
        log.info("Creating new payment transaction for orderId: {}", request.getOrderId());

        PaymentTransaction transaction = paymentTransactionMapper.toPaymentTransaction(request);

        transaction = paymentTransactionRepository.save(transaction);
        return paymentTransactionMapper.toPaymentTransactionResponse(transaction);
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
}
