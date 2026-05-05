package org.example.khoahoc.service;

import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Dùng để ký và xác thực chữ ký HMAC-SHA256.
 * Được dùng khi LMS xác thực Webhook callback từ Payment Gateway.
 */
@Service
public class PaymentSignatureService {

    public String sign(String payload, String secretKey) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(raw);
        } catch (Exception e) {
            throw new RuntimeException("Cannot sign payload", e);
        }
    }

    public boolean verify(String payload, String signature, String secretKey) {
        return sign(payload, secretKey).equals(signature);
    }
}
