package com.example.paymentgateway.repository;

import com.example.paymentgateway.entity.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {
    Optional<PaymentOrder> findByGatewayRef(String gatewayRef);
    List<PaymentOrder> findByKhoahocTransactionId(Long khoahocTransactionId);
    List<PaymentOrder> findAllByOrderByCreatedDateDesc();
}
