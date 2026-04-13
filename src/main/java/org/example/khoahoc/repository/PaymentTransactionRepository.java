package org.example.khoahoc.repository;

import org.example.khoahoc.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long>, JpaSpecificationExecutor<PaymentTransaction> {
    List<PaymentTransaction> findByOrderId(Long orderId);
    Optional<PaymentTransaction> findByTransactionRef(String transactionRef);
}
