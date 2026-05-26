package org.example.khoahoc.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "payment_transaction")
public class PaymentTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    Long transactionId;

    @Column(name = "user_id", nullable = false)
    Long userId;

    @Column(name = "order_id", nullable = false)
    Long orderId; // Có thể coi đây là ID của khóa học đang thanh toán, hoặc mã giỏ hàng.

    @Column(name = "amount", nullable = false)
    Double amount;

    @Column(name = "payment_method", length = 50)
    String paymentMethod; // e.g. VNPAY, MOMO, STRIPE

    @Column(name = "ip_address", length = 50)
    String ipAddress;

    @Column(name = "transaction_ref", length = 100)
    String transactionRef; // e.g. transaction ID from the gateway

    @Column(name = "status", length = 50)
    String status; // e.g. SUCCESS, FAILED, PENDING

    @Column(name = "created_date")
    LocalDateTime createdDate;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
    }
}
