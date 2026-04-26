package org.example.khoahoc.mapper;

import org.example.khoahoc.dto.request.TransactionItemCreationRequest;
import org.example.khoahoc.dto.request.TransactionItemUpdateRequest;
import org.example.khoahoc.dto.response.TransactionItemResponse;
import org.example.khoahoc.entity.TransactionItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TransactionItemMapper {

    @Mapping(target = "itemId", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    TransactionItem toTransactionItem(TransactionItemCreationRequest request);

    TransactionItemResponse toTransactionItemResponse(TransactionItem transactionItem);
    List<TransactionItemResponse> toTransactionItemResponseList(List<TransactionItem> transactionItems);

    @Mapping(target = "itemId", ignore = true)
    @Mapping(target = "transactionId", ignore = true)
    @Mapping(target = "courseId", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    void updateTransactionItem(@MappingTarget TransactionItem transactionItem, TransactionItemUpdateRequest request);
}
