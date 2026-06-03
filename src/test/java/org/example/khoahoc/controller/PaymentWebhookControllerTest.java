package org.example.khoahoc.controller;

import tools.jackson.databind.ObjectMapper;
import org.example.khoahoc.config.SecurityConfig;
import org.example.khoahoc.dto.request.WebhookCallbackRequest;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.security.JwtAuthenticationFilter;
import org.example.khoahoc.security.JwtTokenProvider;
import org.example.khoahoc.service.PaymentSignatureService;
import org.example.khoahoc.service.PaymentTransactionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(controllers = PaymentWebhookController.class, properties = {
                "payment.webhook.api-key=test-api-key",
                "payment.webhook.secret-key=test-secret-key"
})
@Import({ SecurityConfig.class, JwtAuthenticationFilter.class })
public class PaymentWebhookControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private PaymentTransactionService paymentTransactionService;

        @MockitoBean
        private PaymentSignatureService paymentSignatureService;

        @MockitoBean
        private JwtTokenProvider jwtTokenProvider;

        @Test
        public void testHandlePaymentWebhook_Success() throws Exception {
                WebhookCallbackRequest request = WebhookCallbackRequest.builder()
                                .transactionRef("TX123456")
                                .orderId(10L)
                                .userId(1L)
                                .amount(BigDecimal.valueOf(199.99))
                                .status("SUCCESS")
                                .timestamp("1234567890")
                                .nonce("random-nonce")
                                .build();

                when(paymentSignatureService.verify(anyString(), anyString(), eq("test-secret-key"))).thenReturn(true);

                mockMvc.perform(post("/api/webhook/payment")
                                .header("X-Api-Key", "test-api-key")
                                .header("X-Signature", "valid-signature")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value(200))
                                .andExpect(jsonPath("$.message").value("Webhook xử lý thành công"))
                                .andExpect(jsonPath("$.result").value("Success"));

                verify(paymentTransactionService).processPaymentWebhook(any(WebhookCallbackRequest.class));
        }

        @Test
        public void testHandlePaymentWebhook_Idempotent() throws Exception {
                WebhookCallbackRequest request = WebhookCallbackRequest.builder()
                                .transactionRef("TX123456")
                                .orderId(10L)
                                .userId(1L)
                                .amount(BigDecimal.valueOf(199.99))
                                .status("SUCCESS")
                                .timestamp("1234567890")
                                .nonce("random-nonce")
                                .build();

                when(paymentSignatureService.verify(anyString(), anyString(), eq("test-secret-key"))).thenReturn(true);

                mockMvc.perform(post("/api/webhook/payment")
                                .header("X-Api-Key", "test-api-key")
                                .header("X-Signature", "valid-signature")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.code").value(200))
                                .andExpect(jsonPath("$.message").value("Webhook xử lý thành công"))
                                .andExpect(jsonPath("$.result").value("Success"));

                verify(paymentTransactionService).processPaymentWebhook(any(WebhookCallbackRequest.class));
        }

        @Test
        public void testHandlePaymentWebhook_InvalidApiKey() throws Exception {
                WebhookCallbackRequest request = WebhookCallbackRequest.builder().build();

                mockMvc.perform(post("/api/webhook/payment")
                                .header("X-Api-Key", "wrong-api-key")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.code").value(ErrorCode.INVALID_API_KEY.getCode()))
                                .andExpect(jsonPath("$.message").value(ErrorCode.INVALID_API_KEY.getMessage()));
        }

        @Test
        public void testHandlePaymentWebhook_InvalidSignature() throws Exception {
                WebhookCallbackRequest request = WebhookCallbackRequest.builder()
                                .transactionRef("TX123456")
                                .orderId(10L)
                                .userId(1L)
                                .amount(BigDecimal.valueOf(199.99))
                                .status("SUCCESS")
                                .timestamp("1234567890")
                                .nonce("random-nonce")
                                .build();

                when(paymentSignatureService.verify(anyString(), anyString(), eq("test-secret-key"))).thenReturn(false);

                mockMvc.perform(post("/api/webhook/payment")
                                .header("X-Api-Key", "test-api-key")
                                .header("X-Signature", "invalid-signature")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.code").value(ErrorCode.INVALID_SIGNATURE.getCode()))
                                .andExpect(jsonPath("$.message").value(ErrorCode.INVALID_SIGNATURE.getMessage()));
        }

        @Test
        public void testHandlePaymentWebhook_TransactionNotFound() throws Exception {
                WebhookCallbackRequest request = WebhookCallbackRequest.builder()
                                .transactionRef("TX123456")
                                .orderId(10L)
                                .userId(1L)
                                .amount(BigDecimal.valueOf(199.99))
                                .status("SUCCESS")
                                .timestamp("1234567890")
                                .nonce("random-nonce")
                                .build();

                when(paymentSignatureService.verify(anyString(), anyString(), eq("test-secret-key"))).thenReturn(true);
                doThrow(new AppException(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND))
                                .when(paymentTransactionService).processPaymentWebhook(any());

                mockMvc.perform(post("/api/webhook/payment")
                                .header("X-Api-Key", "test-api-key")
                                .header("X-Signature", "valid-signature")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isNotFound())
                                .andExpect(jsonPath("$.code").value(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND.getCode()))
                                .andExpect(jsonPath("$.message").value(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND.getMessage()));
        }
}
