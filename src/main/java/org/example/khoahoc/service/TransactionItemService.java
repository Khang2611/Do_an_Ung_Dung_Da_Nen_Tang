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
import org.example.khoahoc.mapper.TransactionItemMapper;
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
    TransactionItemMapper transactionItemMapper;

    public TransactionItemResponse createTransactionItem(TransactionItemCreationRequest request) {
        log.info("Creating new transaction item for transactionId: {}, courseId: {}", request.getTransactionId(), request.getCourseId());

        TransactionItem transactionItem = transactionItemMapper.toTransactionItem(request);

        transactionItem = transactionItemRepository.save(transactionItem);
        return transactionItemMapper.toTransactionItemResponse(transactionItem);
    }

    public TransactionItemResponse getTransactionItem(Long id) {
        TransactionItem transactionItem = transactionItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TRANSACTION_ITEM_NOT_FOUND));
        return transactionItemMapper.toTransactionItemResponse(transactionItem);
    }

    public List<TransactionItemResponse> getAllTransactionItems() {
        return transactionItemMapper.toTransactionItemResponseList(transactionItemRepository.findAll());
    }

    public List<TransactionItemResponse> getTransactionItemsByTransactionId(Long transactionId) {
        return transactionItemMapper.toTransactionItemResponseList(transactionItemRepository.findByTransactionId(transactionId));
    }

    public TransactionItemResponse updateTransactionItem(Long id, TransactionItemUpdateRequest request) {
        TransactionItem transactionItem = transactionItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TRANSACTION_ITEM_NOT_FOUND));

        transactionItemMapper.updateTransactionItem(transactionItem, request);

        transactionItem = transactionItemRepository.save(transactionItem);
        return transactionItemMapper.toTransactionItemResponse(transactionItem);
    }

    public void deleteTransactionItem(Long id) {
        TransactionItem transactionItem = transactionItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TRANSACTION_ITEM_NOT_FOUND));
        transactionItemRepository.delete(transactionItem);
    }
}
