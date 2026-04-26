package org.example.khoahoc.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // ── 5xxx → 500 Internal Server Error ───────────────────────────────
    UNCATEGORIZED_EXCEPTION(5000, "Lỗi không xác định", HttpStatus.INTERNAL_SERVER_ERROR),

    // ── 400x → 400 Bad Request ──────────────────────────────────────────
    INVALID_ROLE                (4001, "Vai trò không hợp lệ",                HttpStatus.BAD_REQUEST),

    // ── 401x → 401 Unauthorized ─────────────────────────────────────────
    INVALID_CREDENTIALS         (4010, "Tên đăng nhập hoặc mật khẩu không đúng", HttpStatus.UNAUTHORIZED),

    // ── 403x → 403 Forbidden ────────────────────────────────────────────
    UNAUTHORIZED_ACTION         (4031, "Bạn không có quyền thực hiện hành động này", HttpStatus.FORBIDDEN),

    // ── 409x → 409 Conflict ─────────────────────────────────────────────
    USER_EXISTED                (4090, "Người dùng đã tồn tại",               HttpStatus.CONFLICT),
    ENROLLMENT_EXISTED          (4091, "Người dùng đã đăng ký khóa học này",  HttpStatus.CONFLICT),
    LEARNING_PROGRESS_EXISTED   (4092, "Tiến độ học tập đã tồn tại",          HttpStatus.CONFLICT),

    // ── 404x → 404 Not Found ────────────────────────────────────────────
    USER_NOT_FOUND              (4041, "Người dùng không tồn tại",            HttpStatus.NOT_FOUND),
    COURSE_NOT_FOUND            (4042, "Khóa học không tồn tại",              HttpStatus.NOT_FOUND),
    CATEGORY_NOT_FOUND          (4043, "Danh mục không tồn tại",              HttpStatus.NOT_FOUND),
    CHAPTER_NOT_FOUND           (4044, "Chương không tồn tại",                HttpStatus.NOT_FOUND),
    LESSON_NOT_FOUND            (4045, "Bài học không tồn tại",               HttpStatus.NOT_FOUND),
    ORDER_NOT_FOUND             (4046, "Đơn hàng không tồn tại",              HttpStatus.NOT_FOUND),
    RESOURCE_NOT_FOUND          (4047, "Tài liệu không tồn tại",              HttpStatus.NOT_FOUND),
    PAYMENT_TRANSACTION_NOT_FOUND(4048, "Giao dịch thanh toán không tồn tại", HttpStatus.NOT_FOUND),
    TRANSACTION_ITEM_NOT_FOUND  (4049, "Mục giao dịch không tồn tại",        HttpStatus.NOT_FOUND),
    ENROLLMENT_NOT_FOUND        (4050, "Đăng ký khóa học không tồn tại",     HttpStatus.NOT_FOUND),
    LEARNING_PROGRESS_NOT_FOUND (4051, "Tiến độ học tập không tồn tại",      HttpStatus.NOT_FOUND);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
