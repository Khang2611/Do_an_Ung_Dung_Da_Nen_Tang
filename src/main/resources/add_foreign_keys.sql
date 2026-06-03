-- =============================================================================
-- SQL Script: Bổ sung ràng buộc khóa ngoại (Foreign Key Constraints)
-- Dự án: LMS KhoaHoc (da_khoahoc)
-- Mục đích: Đảm bảo toàn vẹn dữ liệu tầng DB & đồng bộ hiển thị ERD trên MySQL Workbench.
-- Hướng dẫn: Chạy script này trực tiếp trên cơ sở dữ liệu MySQL của bạn sau khi 
--            Hibernate đã tạo các bảng (ddl-auto=update).
-- =============================================================================

USE da_khoahoc;

-- 1. Liên kết: Chapter -> Course (Một khóa học có nhiều chương)
ALTER TABLE chapter 
ADD CONSTRAINT fk_chapter_course 
FOREIGN KEY (course_id) REFERENCES course(course_id) 
ON DELETE CASCADE;

-- 2. Liên kết: Lesson -> Chapter (Một chương học có nhiều bài học)
ALTER TABLE lesson 
ADD CONSTRAINT fk_lesson_chapter 
FOREIGN KEY (chapter_id) REFERENCES chapter(chapter_id) 
ON DELETE CASCADE;

-- 3. Liên kết: Resource -> Lesson (Một bài học có nhiều tài liệu đính kèm)
ALTER TABLE resource 
ADD CONSTRAINT fk_resource_lesson 
FOREIGN KEY (lesson_id) REFERENCES lesson(lesson_id) 
ON DELETE CASCADE;

-- 4. Liên kết: VideoEncryptionKey -> Lesson (Quan hệ 1-1 bảo mật video bài học)
ALTER TABLE video_encryption_key 
ADD CONSTRAINT fk_key_lesson 
FOREIGN KEY (lesson_id) REFERENCES lesson(lesson_id) 
ON DELETE CASCADE;

-- 5. Liên kết: Enrollment -> User (Một người dùng có nhiều lượt đăng ký học)
ALTER TABLE enrollment 
ADD CONSTRAINT fk_enrollment_user 
FOREIGN KEY (user_id) REFERENCES user(user_id) 
ON DELETE CASCADE;

-- 6. Liên kết: Enrollment -> Course (Một khóa học có nhiều học viên đăng ký)
ALTER TABLE enrollment 
ADD CONSTRAINT fk_enrollment_course 
FOREIGN KEY (course_id) REFERENCES course(course_id) 
ON DELETE CASCADE;

-- 7. Liên kết: LearningProgress -> Enrollment (Một lượt đăng ký có nhiều tiến trình học của các bài)
ALTER TABLE learning_progress 
ADD CONSTRAINT fk_progress_enrollment 
FOREIGN KEY (enrollment_id) REFERENCES enrollment(enrollment_id) 
ON DELETE CASCADE;

-- 8. Liên kết: LearningProgress -> Lesson (Tiến trình học ghi nhận cho bài học cụ thể)
ALTER TABLE learning_progress 
ADD CONSTRAINT fk_progress_lesson 
FOREIGN KEY (lesson_id) REFERENCES lesson(lesson_id) 
ON DELETE CASCADE;

-- 9. Liên kết: PaymentTransaction -> User (Giao dịch thanh toán thuộc về người dùng)
ALTER TABLE payment_transaction 
ADD CONSTRAINT fk_transaction_user 
FOREIGN KEY (user_id) REFERENCES user(user_id) 
ON DELETE CASCADE;

-- 10. Liên kết: TransactionItem -> PaymentTransaction (Chi tiết đơn hàng nằm trong giao dịch thanh toán)
ALTER TABLE transaction_item 
ADD CONSTRAINT fk_item_transaction 
FOREIGN KEY (transaction_id) REFERENCES payment_transaction(transaction_id) 
ON DELETE CASCADE;

-- 11. Liên kết: TransactionItem -> Course (Chi tiết đơn hàng mua khóa học cụ thể)
ALTER TABLE transaction_item 
ADD CONSTRAINT fk_item_course 
FOREIGN KEY (course_id) REFERENCES course(course_id) 
ON DELETE CASCADE;
