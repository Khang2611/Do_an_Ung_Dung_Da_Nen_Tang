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

    // Lấy lịch sử giao dịch theo người dùng
    List<PaymentTransaction> findByUserId(Long userId);

    // Lấy giao dịch theo trạng thái (SUCCESS, FAILED, PENDING)
    List<PaymentTransaction> findByStatus(String status);

    // Lấy giao dịch theo user và trạng thái
    List<PaymentTransaction> findByUserIdAndStatus(Long userId, String status);
}
