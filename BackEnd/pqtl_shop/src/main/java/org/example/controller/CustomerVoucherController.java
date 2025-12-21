package org.example.controller;

import org.example.dto.request.VoucherApplyRequest;
import org.example.dto.response.UserVoucherResponse;
import org.example.dto.response.VoucherApplyResponse;
import org.example.dto.response.VoucherResponse;
import org.example.model.login.User;
import org.example.service.VoucherService;
import org.example.service.login.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller xử lý các API voucher dành cho Customer
 */
@RestController
@RequestMapping("/api/v1/vouchers")
@CrossOrigin(origins = "*")
public class CustomerVoucherController {

    @Autowired
    private VoucherService voucherService;

    @Autowired
    private UserService userService;

    /**
     * Lấy danh sách voucher có thể đổi
     * GET /api/v1/vouchers/
     */
    @GetMapping("/")
    public ResponseEntity<List<VoucherResponse>> getAvailableVouchers() {
        try {
            List<VoucherResponse> vouchers = voucherService.getAvailableVouchers();
            return ResponseEntity.ok(vouchers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Đổi điểm lấy voucher
     * POST /api/v1/vouchers/redeem/{voucherId}/
     */
    @PostMapping("/redeem/{voucherId}/")
    public ResponseEntity<?> redeemVoucher(
            @PathVariable String voucherId,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.getUser(email);
            String userId = user.getId();
            UserVoucherResponse result = voucherService.redeemVoucher(userId, voucherId);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("detail", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("detail", "Đổi voucher thất bại: " + e.getMessage()));
        }
    }

    /**
     * Lấy danh sách voucher đã đổi của user
     * GET /api/v1/vouchers/redeemed_vouchers/
     */
    @GetMapping("/redeemed_vouchers/")
    public ResponseEntity<?> getRedeemedVouchers(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.getUser(email);
            String userId = user.getId();
            List<UserVoucherResponse> vouchers = voucherService.getUserRedeemedVouchers(userId);
            return ResponseEntity.ok(vouchers);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("detail", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("detail", "Lỗi khi lấy danh sách voucher: " + e.getMessage()));
        }
    }

    /**
     * Lấy voucher chưa sử dụng của user
     * GET /api/v1/vouchers/unused/
     */
    @GetMapping("/unused/")
    public ResponseEntity<?> getUnusedVouchers(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.getUser(email);
            String userId = user.getId();
            List<UserVoucherResponse> vouchers = voucherService.getUserUnusedVouchers(userId);
            return ResponseEntity.ok(vouchers);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("detail", e.getMessage()));
        }
    }

    /**
     * Áp dụng voucher vào đơn hàng (kiểm tra trước khi đặt)
     * POST /api/v1/vouchers/apply/
     */
    @PostMapping("/apply/")
    public ResponseEntity<?> applyVoucher(
            @RequestBody VoucherApplyRequest request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.getUser(email);
            String userId = user.getId();
            VoucherApplyResponse result = voucherService.applyVoucher(userId, request);
            
            if (result.getSuccess()) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("detail", e.getMessage()));
        }
    }
}
