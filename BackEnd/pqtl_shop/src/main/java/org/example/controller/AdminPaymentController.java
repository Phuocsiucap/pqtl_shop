package org.example.controller;

import org.example.model.PaymentTransaction;
import org.example.service.VNPayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/payments")
@CrossOrigin(origins = {"http://localhost:8888", "http://localhost:5173"}, allowCredentials = "true")
public class AdminPaymentController {

    @Autowired
    private VNPayService vnPayService;

    /**
     * Lấy tất cả giao dịch
     * GET /api/v1/admin/payments
     */
    @GetMapping
    public ResponseEntity<List<PaymentTransaction>> getAllTransactions() {
        List<PaymentTransaction> transactions = vnPayService.getAllTransactions();
        return ResponseEntity.ok(transactions);
    }

    /**
     * Lấy thống kê giao dịch
     * GET /api/v1/admin/payments/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getTransactionStats() {
        Map<String, Object> stats = vnPayService.getTransactionStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Lấy giao dịch theo order ID
     * GET /api/v1/admin/payments/order/{orderId}
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getTransactionByOrderId(@PathVariable String orderId) {
        return vnPayService.getTransactionByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
