package com.example.paymentgateway.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * KhoaHoc gửi sang khi redirect người dùng tới Gateway.
 * Truyền qua query params trên URL.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InitPaymentRequest {
    /** transactionId trong DB của KhoaHoc */
    Long transactionId;
    /** userId */
    Long userId;
    /** Số tiền */
    Double amount;
    /** Tên khóa học (có thể nhiều, cách nhau dấu phẩy) */
    String courseNames;
    /** URL để gateway redirect về sau khi xong */
    String returnUrl;
}
