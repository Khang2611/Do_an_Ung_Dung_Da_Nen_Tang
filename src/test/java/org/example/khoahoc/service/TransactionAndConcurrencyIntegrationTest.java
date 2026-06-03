package org.example.khoahoc.service;

import org.example.khoahoc.dto.request.EnrollmentCreationRequest;
import org.example.khoahoc.dto.request.WebhookCallbackRequest;
import org.example.khoahoc.entity.Course;
import org.example.khoahoc.entity.Enrollment;
import org.example.khoahoc.entity.PaymentTransaction;
import org.example.khoahoc.entity.TransactionItem;
import org.example.khoahoc.entity.User;
import org.example.khoahoc.enums.Role;
import org.example.khoahoc.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class TransactionAndConcurrencyIntegrationTest {

    @Autowired
    PaymentTransactionService paymentTransactionService;

    @Autowired
    EnrollmentService enrollmentService;

    @Autowired
    UserRepository userRepository;

    @Autowired
    CourseRepository courseRepository;

    @Autowired
    PaymentTransactionRepository paymentTransactionRepository;

    @Autowired
    TransactionItemRepository transactionItemRepository;

    @Autowired
    EnrollmentRepository enrollmentRepository;

    User testUser;
    Course testCourse1;
    Course testCourse2;

    @BeforeEach
    void setUp() {
        // Tạo dữ liệu sạch trong DB
        testUser = userRepository.save(User.builder()
                .username("txn_test_user_" + UUID.randomUUID().toString().substring(0, 8))
                .password("password")
                .email("txn_test_" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .fullName("Test User")
                .role(Role.USER)
                .build());

        testCourse1 = courseRepository.save(Course.builder()
                .title("Course 1")
                .price(100.0)
                .build());

        testCourse2 = courseRepository.save(Course.builder()
                .title("Course 2")
                .price(150.0)
                .build());
    }

    @AfterEach
    void tearDown() {
        // Dọn dẹp dữ liệu để tránh ảnh hưởng đến các test khác
        if (testUser != null) {
            List<Enrollment> enrollments = enrollmentRepository.findByUserId(testUser.getUserId());
            enrollmentRepository.deleteAll(enrollments);

            List<PaymentTransaction> txns = paymentTransactionRepository.findByUserId(testUser.getUserId());
            for (PaymentTransaction txn : txns) {
                List<TransactionItem> items = transactionItemRepository.findByTransactionId(txn.getTransactionId());
                transactionItemRepository.deleteAll(items);
                paymentTransactionRepository.delete(txn);
            }
            userRepository.delete(testUser);
        }
        if (testCourse1 != null) {
            courseRepository.delete(testCourse1);
        }
        if (testCourse2 != null) {
            courseRepository.delete(testCourse2);
        }
    }

    @Test
    void testWebhook_RollbackOnEnrollmentFailure() {
        // 1. Tạo một PaymentTransaction với trạng thái PENDING
        String txnRef = "TXN_TEST_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        PaymentTransaction transaction = paymentTransactionRepository.save(PaymentTransaction.builder()
                .userId(testUser.getUserId())
                .orderId(999L)
                .amount(250.0)
                .status("PENDING")
                .transactionRef(txnRef)
                .build());

        // 2. Tạo 2 TransactionItem: 1 hợp lệ (testCourse1) và 1 lỗi (courseId = -999L
        // không tồn tại)
        transactionItemRepository.save(TransactionItem.builder()
                .transactionId(transaction.getTransactionId())
                .courseId(testCourse1.getCourseId())
                .amount(100.0)
                .build());

        transactionItemRepository.save(TransactionItem.builder()
                .transactionId(transaction.getTransactionId())
                .courseId(-999L) // Không hợp lệ
                .amount(150.0)
                .build());

        // 3. Chuẩn bị Webhook callback SUCCESS
        WebhookCallbackRequest webhookRequest = WebhookCallbackRequest.builder()
                .transactionRef(txnRef)
                .orderId(999L)
                .userId(testUser.getUserId())
                .amount(BigDecimal.valueOf(250.0))
                .status("SUCCESS")
                .timestamp(String.valueOf(System.currentTimeMillis()))
                .nonce("nonce")
                .build();

        // 4. Gọi webhook, kì vọng ném ngoại lệ do course -999L không tồn tại
        assertThrows(Exception.class, () -> {
            paymentTransactionService.processPaymentWebhook(webhookRequest);
        });

        // 5. Kiểm chứng rollback: Trạng thái transaction phải giữ nguyên là PENDING
        // (không bị chuyển sang SUCCESS)
        PaymentTransaction updatedTransaction = paymentTransactionRepository.findById(transaction.getTransactionId())
                .orElseThrow();
        assertEquals("PENDING", updatedTransaction.getStatus());

        // Đảm bảo không có Enrollment nào được tạo cho User (cả testCourse1 hợp lệ cũng
        // bị rollback)
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(testUser.getUserId());
        assertTrue(enrollments.isEmpty(), "Mối quan hệ đăng ký học phải được rollback hoàn toàn.");
    }

    @Test
    void testConcurrency_DuplicateEnrollmentConstraint() throws Exception {
        int threadCount = 4;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(1);
        List<Future<Boolean>> futures = new ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            futures.add(executor.submit(() -> {
                latch.await(); // Chờ tín hiệu đồng bộ để tất cả các luồng chạy cùng lúc
                try {
                    enrollmentService.createEnrollment(EnrollmentCreationRequest.builder()
                            .userId(testUser.getUserId())
                            .courseId(testCourse1.getCourseId())
                            .build());
                    return true;
                } catch (Exception e) {
                    return false;
                }
            }));
        }

        latch.countDown(); // Phát tín hiệu bắt đầu cho tất cả các luồng
        executor.shutdown();

        int successCount = 0;
        int failureCount = 0;
        for (Future<Boolean> future : futures) {
            if (future.get()) {
                successCount++;
            } else {
                failureCount++;
            }
        }

        // Kiểm chứng: Chỉ có duy nhất 1 luồng thành công, các luồng trùng lặp khác bị
        // database chặn lại
        assertEquals(1, successCount, "Chỉ duy nhất một đăng ký được thành công.");
        assertEquals(threadCount - 1, failureCount, "Các đăng ký trùng lặp khác phải thất bại.");

        List<Enrollment> enrollments = enrollmentRepository.findByUserId(testUser.getUserId());
        assertEquals(1, enrollments.size(), "Chỉ có đúng 1 bản ghi trong DB.");
    }
}
