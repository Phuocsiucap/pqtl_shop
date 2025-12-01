package org.example.controller;

import org.example.dto.request.VoucherCreateRequest;
import org.example.dto.request.VoucherUpdateRequest;
import org.example.dto.response.VoucherResponse;
import org.example.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller xử lý các API voucher dành cho Admin
 */
@RestController
@RequestMapping("/api/v1/admin/vouchers")
@CrossOrigin(origins = "*")
public class AdminVoucherController {

    @Autowired
    private VoucherService voucherService;

    /**
     * Lấy tất cả vouchers
     * GET /api/v1/admin/vouchers/
     */
    @GetMapping("/")
    public ResponseEntity<List<VoucherResponse>> getAllVouchers() {
        try {
            List<VoucherResponse> vouchers = voucherService.getAllVouchers();
            return ResponseEntity.ok(vouchers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Lấy voucher theo ID
     * GET /api/v1/admin/vouchers/{id}/
     */
    @GetMapping("/{id}/")
    public ResponseEntity<?> getVoucherById(@PathVariable String id) {
        try {
            VoucherResponse voucher = voucherService.getVoucherById(id);
            return ResponseEntity.ok(voucher);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Tạo voucher mới
     * POST /api/v1/admin/vouchers/
     */
    @PostMapping("/")
    public ResponseEntity<?> createVoucher(@RequestBody VoucherCreateRequest request) {
        try {
            VoucherResponse voucher = voucherService.createVoucher(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(voucher);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Tạo voucher thất bại: " + e.getMessage()));
        }
    }

    /**
     * Cập nhật voucher
     * PUT /api/v1/admin/vouchers/{id}/
     */
    @PutMapping("/{id}/")
    public ResponseEntity<?> updateVoucher(@PathVariable String id, @RequestBody VoucherUpdateRequest request) {
        try {
            VoucherResponse voucher = voucherService.updateVoucher(id, request);
            return ResponseEntity.ok(voucher);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Cập nhật voucher thất bại: " + e.getMessage()));
        }
    }

    /**
     * Xóa voucher
     * DELETE /api/v1/admin/vouchers/{id}/
     */
    @DeleteMapping("/{id}/")
    public ResponseEntity<?> deleteVoucher(@PathVariable String id) {
        try {
            voucherService.deleteVoucher(id);
            return ResponseEntity.ok(Map.of("message", "Xóa voucher thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Xóa voucher thất bại: " + e.getMessage()));
        }
    }

    /**
     * Kích hoạt/vô hiệu hóa voucher
     * PATCH /api/v1/admin/vouchers/{id}/toggle/
     */
    @PatchMapping("/{id}/toggle/")
    public ResponseEntity<?> toggleVoucherStatus(@PathVariable String id) {
        try {
            VoucherResponse voucher = voucherService.toggleVoucherStatus(id);
            String status = voucher.getIsActive() ? "kích hoạt" : "vô hiệu hóa";
            return ResponseEntity.ok(Map.of(
                    "message", "Đã " + status + " voucher",
                    "voucher", voucher
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
