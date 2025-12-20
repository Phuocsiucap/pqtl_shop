package org.example.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.example.dto.VNPayRequestDTO;
import org.example.dto.VNPayResponseDTO;
import org.example.model.PaymentTransaction;
import org.example.service.VNPayService;
import org.example.service.login.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:8888", "http://localhost:5173"}, allowCredentials = "true")
public class VNPayController {

    @Autowired
    private VNPayService vnPayService;

    @Autowired
    private JwtService jwtService;

    /**
     * Tạo URL thanh toán VNPAY
     * POST /api/vn/payment
     */
    @PostMapping("/vn/payment")
    public ResponseEntity<VNPayResponseDTO> createPayment(
            @RequestBody VNPayRequestDTO request,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest httpRequest) {
        
        String userId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                userId = jwtService.extractUsername(token);
            } catch (Exception e) {
                // Token invalid, continue without userId
            }
        }

        VNPayResponseDTO response = vnPayService.createPaymentUrl(request, httpRequest, userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Xử lý callback từ VNPAY (redirect sau khi thanh toán)
     * GET /api/vn/payment-return
     */
    @GetMapping("/vn/payment-return")
    public ResponseEntity<VNPayResponseDTO> paymentReturn(HttpServletRequest request) {
        VNPayResponseDTO response = vnPayService.processPaymentReturn(request);
        return ResponseEntity.ok(response);
    }

    /**
     * IPN (Instant Payment Notification) - VNPAY gọi đến server
     * GET /api/vn/payment-ipn
     */
    @GetMapping("/vn/payment-ipn")
    public ResponseEntity<Map<String, String>> paymentIPN(HttpServletRequest request) {
        VNPayResponseDTO response = vnPayService.processPaymentReturn(request);
        
        Map<String, String> result;
        if ("00".equals(response.getCode())) {
            result = Map.of("RspCode", "00", "Message", "Confirm Success");
        } else {
            result = Map.of("RspCode", response.getCode(), "Message", response.getMessage());
        }
        
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy lịch sử giao dịch của user
     * GET /api/vn/transactions
     */
    @GetMapping("/vn/transactions")
    public ResponseEntity<List<PaymentTransaction>> getUserTransactions(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authHeader.substring(7);
        String userId = jwtService.extractUsername(token);
        
        List<PaymentTransaction> transactions = vnPayService.getUserTransactions(userId);
        return ResponseEntity.ok(transactions);
    }

    /**
     * Lấy thông tin giao dịch theo order ID
     * GET /api/vn/transaction/{orderId}
     */
    @GetMapping("/vn/transaction/{orderId}")
    public ResponseEntity<?> getTransactionByOrderId(@PathVariable String orderId) {
        return vnPayService.getTransactionByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Lấy message từ response code (utility)
     * GET /api/vn/response-message/{code}
     */
    @GetMapping("/vn/response-message/{code}")
    public ResponseEntity<Map<String, String>> getResponseMessage(@PathVariable String code) {
        String message = vnPayService.getVNPayResponseMessage(code);
        return ResponseEntity.ok(Map.of("code", code, "message", message));
    }
}
