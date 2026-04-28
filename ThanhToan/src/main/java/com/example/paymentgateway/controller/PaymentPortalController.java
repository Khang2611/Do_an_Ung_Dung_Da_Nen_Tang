package com.example.paymentgateway.controller;

import com.example.paymentgateway.entity.PaymentOrder;
import com.example.paymentgateway.service.PaymentGatewayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

/**
 * Controller phục vụ frontend portal (Thymeleaf).
 * Người dùng được redirect từ KhoaHoc sang đây để thanh toán.
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class PaymentPortalController {

    private final PaymentGatewayService paymentGatewayService;

    @Value("${payment.simulation.delay-seconds:3}")
    private int simulationDelay;

    /**
     * BƯỚC 1: KhoaHoc redirect user sang đây.
     * URL: GET /pay?transactionId=X&userId=Y&amount=Z&courseNames=...&returnUrl=...
     *
     * Gateway tạo PaymentOrder, hiển thị trang chọn phương thức thanh toán.
     */
    @GetMapping("/pay")
    public String showPaymentPage(
            @RequestParam Long transactionId,
            @RequestParam Long userId,
            @RequestParam Double amount,
            @RequestParam(defaultValue = "") String courseNames,
            @RequestParam(required = false) String returnUrl,
            Model model) {

        log.info("Nhận yêu cầu thanh toán: transactionId={}, userId={}, amount={}", transactionId, userId, amount);

        // Tạo đơn hàng trong Gateway DB
        PaymentOrder order = paymentGatewayService.createOrder(transactionId, userId, amount, courseNames);

        model.addAttribute("order", order);
        model.addAttribute("returnUrl", returnUrl != null ? returnUrl : "http://localhost:8080");
        return "pay";
    }

    /**
     * BƯỚC 2: User chọn phương thức và submit form.
     * POST /pay/confirm
     */
    @PostMapping("/pay/confirm")
    public String confirmPayment(
            @RequestParam Long gwOrderId,
            @RequestParam String paymentMethod,
            @RequestParam(required = false) String returnUrl,
            Model model) {

        log.info("Xác nhận thanh toán: gwOrderId={}, method={}", gwOrderId, paymentMethod);

        PaymentOrder order = paymentGatewayService.processPayment(gwOrderId, paymentMethod);

        model.addAttribute("order", order);
        model.addAttribute("returnUrl", returnUrl != null ? returnUrl : "http://localhost:8080");
        model.addAttribute("simulationDelay", simulationDelay);
        return "confirm";
    }

    /**
     * BƯỚC 3: Trang "đang xử lý" – sau delay sẽ gọi AJAX finalize.
     * POST /pay/finalize (AJAX từ confirm.html)
     */
    @PostMapping("/pay/finalize")
    @ResponseBody
    public String finalizePayment(
            @RequestParam Long gwOrderId,
            @RequestParam(defaultValue = "true") boolean success) {

        log.info("Hoàn tất thanh toán: gwOrderId={}, success={}", gwOrderId, success);
        PaymentOrder order = paymentGatewayService.finalizePayment(gwOrderId, success);
        return order.getStatus();
    }

    /**
     * BƯỚC 4: Trang kết quả sau khi xử lý xong.
     * GET /pay/result?gwOrderId=X
     */
    @GetMapping("/pay/result")
    public String showResult(
            @RequestParam Long gwOrderId,
            @RequestParam(required = false) String returnUrl,
            Model model) {

        PaymentOrder order = paymentGatewayService.getOrder(gwOrderId);
        model.addAttribute("order", order);
        model.addAttribute("returnUrl", returnUrl != null ? returnUrl : "http://localhost:8080");
        return "result";
    }

    /**
     * Người dùng bấm "Hủy thanh toán".
     * POST /pay/cancel
     */
    @PostMapping("/pay/cancel")
    public String cancelPayment(
            @RequestParam Long gwOrderId,
            @RequestParam(required = false) String returnUrl) {

        log.info("Người dùng hủy thanh toán: gwOrderId={}", gwOrderId);
        paymentGatewayService.cancelOrder(gwOrderId);
        String redirect = returnUrl != null ? returnUrl : "http://localhost:8080";
        return "redirect:/pay/result?gwOrderId=" + gwOrderId + "&returnUrl=" + redirect;
    }

    /**
     * Trang Admin Portal - xem toàn bộ giao dịch.
     * GET /admin
     */
    @GetMapping("/admin")
    public String adminPortal(Model model) {
        model.addAttribute("orders", paymentGatewayService.getAllOrders());
        return "admin";
    }
}
