package org.example.khoahoc.controller;

import tools.jackson.databind.ObjectMapper;
import org.example.khoahoc.config.SecurityConfig;
import org.example.khoahoc.dto.request.WebhookCallbackRequest;
import org.example.khoahoc.dto.response.PaymentTransactionResponse;
import org.example.khoahoc.entity.PaymentTransaction;
import org.example.khoahoc.entity.TransactionItem;
import org.example.khoahoc.exception.AppException;
import org.example.khoahoc.exception.ErrorCode;
import org.example.khoahoc.repository.PaymentTransactionRepository;
import org.example.khoahoc.repository.TransactionItemRepository;
import org.example.khoahoc.security.JwtAuthenticationFilter;
import org.example.khoahoc.security.JwtTokenProvider;
import org.example.khoahoc.service.EnrollmentService;
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
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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
        private PaymentTransactionRepository paymentTransactionRepository;

        @MockitoBean
        private TransactionItemRepository transactionItemRepository;

        @MockitoBean
        private EnrollmentService enrollmentService;

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

                PaymentTransaction transaction = PaymentTransaction.builder()
                                .transactionId(100L)
                                .transactionRef("TX123456")
                                .build();

                PaymentTransactionResponse response = PaymentTransactionResponse.builder()
                                .transactionId(100L)
                                .transactionRef("TX123456")
                                .userId(1L)
                                .status("SUCCESS")
                                .build();

                TransactionItem item1 = TransactionItem.builder()
                                .transactionId(100L)
                                .courseId(5L)
                                .build();

                TransactionItem item2 = TransactionItem.builder()
                                .transactionId(100L)
                                .courseId(6L)
                                .build();

                when(paymentSignatureService.verify(anyString(), anyString(), eq("test-secret-key"))).thenReturn(true);
                when(paymentTransactionRepository.findByTransactionRef("TX123456"))
                                .thenReturn(Optional.of(transaction));
                when(paymentTransactionService.updateTransaction(eq(100L), any())).thenReturn(response);
                when(transactionItemRepository.findByTransactionId(100L)).thenReturn(List.of(item1, item2));

                mockMvc.perform(post("/api/webhook/payment")
                                .header("X-Api-Key", "test-api-key")
                                .header("X-Signature", "valid-signature")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(content().string("Webhook xử lý thành công"));

                verify(enrollmentService)
                                .createEnrollment(argThat(r -> r.getUserId().equals(1L) && r.getCourseId().equals(5L)));
                verify(enrollmentService)
                                .createEnrollment(argThat(r -> r.getUserId().equals(1L) && r.getCourseId().equals(6L)));
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

                PaymentTransaction transaction = PaymentTransaction.builder()
                                .transactionId(100L)
                                .transactionRef("TX123456")
                                .build();

                PaymentTransactionResponse response = PaymentTransactionResponse.builder()
                                .transactionId(100L)
                                .transactionRef("TX123456")
                                .userId(1L)
                                .status("SUCCESS")
                                .build();

                TransactionItem item = TransactionItem.builder()
                                .transactionId(100L)
                                .courseId(5L)
                                .build();

                when(paymentSignatureService.verify(anyString(), anyString(), eq("test-secret-key"))).thenReturn(true);
                when(paymentTransactionRepository.findByTransactionRef("TX123456"))
                                .thenReturn(Optional.of(transaction));
                when(paymentTransactionService.updateTransaction(eq(100L), any())).thenReturn(response);
                when(transactionItemRepository.findByTransactionId(100L)).thenReturn(List.of(item));

                // Ném ngoại lệ đã đăng ký để kiểm thử idempotency
                doThrow(new AppException(ErrorCode.ENROLLMENT_EXISTED))
                                .when(enrollmentService).createEnrollment(any());

                mockMvc.perform(post("/api/webhook/payment")
                                .header("X-Api-Key", "test-api-key")
                                .header("X-Signature", "valid-signature")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(content().string("Webhook xử lý thành công"));
        }

        @Test
        public void testHandlePaymentWebhook_InvalidApiKey() throws Exception {
                WebhookCallbackRequest request = WebhookCallbackRequest.builder().build();

                mockMvc.perform(post("/api/webhook/payment")
                                .header("X-Api-Key", "wrong-api-key")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isUnauthorized())
                                .andExpect(content().string("Invalid API Key"));
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
                                .andExpect(content().string("Invalid Signature"));
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
                when(paymentTransactionRepository.findByTransactionRef("TX123456")).thenReturn(Optional.empty());

                mockMvc.perform(post("/api/webhook/payment")
                                .header("X-Api-Key", "test-api-key")
                                .header("X-Signature", "valid-signature")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isNotFound())
                                .andExpect(content().string(ErrorCode.PAYMENT_TRANSACTION_NOT_FOUND.getMessage()));
        }
}
