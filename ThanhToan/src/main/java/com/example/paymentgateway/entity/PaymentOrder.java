package com.example.paymentgateway.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

/**
 * Lưu thông tin đơn hàng thanh toán nhận từ KhoaHoc (port 8080).
 * Gateway tạo bản ghi này khi nhận redirect từ KhoaHoc.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "gw_payment_order")
public class PaymentOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "gw_order_id")
    Long gwOrderId;

    /** transactionId bên KhoaHoc - dùng để gọi webhook callback */
    @Column(name = "khoahoc_transaction_id", nullable = false)
    Long khoahocTransactionId;

    /** userId bên KhoaHoc */
    @Column(name = "user_id", nullable = false)
    Long userId;

    /** Tổng tiền */
    @Column(name = "amount", nullable = false)
    Double amount;

    /** Phương thức thanh toán người dùng chọn */
    @Column(name = "payment_method", length = 50)
    String paymentMethod;

    /** Tên khóa học (hiển thị trên trang thanh toán) */
    @Column(name = "course_names", columnDefinition = "TEXT")
    String courseNames;

    /**
     * PENDING / PROCESSING / SUCCESS / FAILED / CANCELLED
     */
    @Column(name = "status", length = 30, nullable = false)
    String status;

    /** Mã giao dịch do gateway tự sinh ra */
    @Column(name = "gateway_ref", length = 100, unique = true)
    String gatewayRef;

    @Column(name = "created_date")
    LocalDateTime createdDate;

    @Column(name = "updated_date")
    LocalDateTime updatedDate;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        updatedDate = LocalDateTime.now();
        if (status == null) status = "PENDING";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }
}
