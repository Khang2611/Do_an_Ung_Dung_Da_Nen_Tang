package org.example.khoahoc.repository;

import org.example.khoahoc.entity.TransactionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionItemRepository extends JpaRepository<TransactionItem, Long>, JpaSpecificationExecutor<TransactionItem> {
    List<TransactionItem> findByTransactionId(Long transactionId);
    List<TransactionItem> findByCourseId(Long courseId);
}
