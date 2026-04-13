package org.example.khoahoc.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.khoahoc.dto.request.TransactionItemCreationRequest;
import org.example.khoahoc.dto.request.TransactionItemUpdateRequest;
import org.example.khoahoc.dto.response.TransactionItemResponse;
import org.example.khoahoc.entity.TransactionItem;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.repository.TransactionItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TransactionItemService {

    TransactionItemRepository transactionItemRepository;

    public TransactionItemResponse createTransactionItem(TransactionItemCreationRequest request) {
        log.info("Creating new transaction item for transactionId: {}, courseId: {}", request.getTransactionId(), request.getCourseId());

        TransactionItem transactionItem = TransactionItem.builder()
                .transactionId(request.getTransactionId())
                .courseId(request.getCourseId())
                .amount(request.getAmount())
                .build();

        transactionItem = transactionItemRepository.save(transactionItem);
        return mapToResponse(transactionItem);
    }

    public TransactionItemResponse getTransactionItem(Long id) {
        TransactionItem transactionItem = transactionItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TRANSACTION_ITEM_NOT_FOUND));
        return mapToResponse(transactionItem);
    }

    public List<TransactionItemResponse> getAllTransactionItems() {
        return transactionItemRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TransactionItemResponse> getTransactionItemsByTransactionId(Long transactionId) {
        return transactionItemRepository.findByTransactionId(transactionId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TransactionItemResponse updateTransactionItem(Long id, TransactionItemUpdateRequest request) {
        TransactionItem transactionItem = transactionItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TRANSACTION_ITEM_NOT_FOUND));

        if (request.getAmount() != null) transactionItem.setAmount(request.getAmount());

        transactionItem = transactionItemRepository.save(transactionItem);
        return mapToResponse(transactionItem);
    }

    public void deleteTransactionItem(Long id) {
        TransactionItem transactionItem = transactionItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TRANSACTION_ITEM_NOT_FOUND));
        transactionItemRepository.delete(transactionItem);
    }

    private TransactionItemResponse mapToResponse(TransactionItem transactionItem) {
        return TransactionItemResponse.builder()
                .itemId(transactionItem.getItemId())
                .transactionId(transactionItem.getTransactionId())
                .courseId(transactionItem.getCourseId())
                .amount(transactionItem.getAmount())
                .createdDate(transactionItem.getCreatedDate())
                .build();
    }
}
