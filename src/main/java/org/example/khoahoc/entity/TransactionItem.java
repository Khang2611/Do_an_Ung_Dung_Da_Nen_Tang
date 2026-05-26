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
@Table(name = "transaction_item")
public class TransactionItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    Long itemId;

    @Column(name = "transaction_id", nullable = false)
    Long transactionId;

    @Column(name = "course_id", nullable = false)
    Long courseId;

    @Column(name = "amount", nullable = false)
    Double amount;

    @Column(name = "created_date")
    LocalDateTime createdDate;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
    }
}
