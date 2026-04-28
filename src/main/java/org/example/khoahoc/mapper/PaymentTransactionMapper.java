package org.example.khoahoc.mapper;

import org.example.khoahoc.dto.request.PaymentTransactionCreationRequest;
import org.example.khoahoc.dto.request.PaymentTransactionUpdateRequest;
import org.example.khoahoc.dto.response.PaymentTransactionResponse;
import org.example.khoahoc.entity.PaymentTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PaymentTransactionMapper {

    @Mapping(target = "transactionId", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    PaymentTransaction toPaymentTransaction(PaymentTransactionCreationRequest request);

    @Mapping(target = "gatewayUrl", ignore = true)
PaymentTransactionResponse toPaymentTransactionResponse(PaymentTransaction paymentTransaction);
// gatewayUrl không có trong entity, service tự set sau khi map
    List<PaymentTransactionResponse> toPaymentTransactionResponseList(List<PaymentTransaction> paymentTransactions);

    @Mapping(target = "transactionId", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "orderId", ignore = true)
    @Mapping(target = "amount", ignore = true)
    @Mapping(target = "paymentMethod", ignore = true)
    @Mapping(target = "ipAddress", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    void updatePaymentTransaction(@MappingTarget PaymentTransaction paymentTransaction, PaymentTransactionUpdateRequest request);
}
