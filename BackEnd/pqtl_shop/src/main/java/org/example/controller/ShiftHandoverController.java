package org.example.controller;

import org.example.model.POSOrder;
import org.example.model.Product;
import org.example.model.ShiftHandover;
import org.example.service.ShiftHandoverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/shift")
@CrossOrigin(origins = "*")
public class ShiftHandoverController {
    
    @Autowired
    private ShiftHandoverService shiftHandoverService;
    
    // ==================== SHIFT HANDOVER ENDPOINTS ====================
    
    /**
     * Mở ca mới
     * POST /api/v1/shift/open
     */
    @PostMapping("/open")
    public ResponseEntity<?> openShift(@RequestBody Map<String, Object> shiftData) {
        try {
            ShiftHandover shift = shiftHandoverService.openShift(shiftData);
            return ResponseEntity.status(HttpStatus.CREATED).body(shift);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Đóng ca và bàn giao
     * POST /api/v1/shift/{shiftId}/close
     */
    @PostMapping("/{shiftId}/close")
    public ResponseEntity<?> closeShift(
            @PathVariable String shiftId,
            @RequestBody Map<String, Object> closeData) {
        try {
            ShiftHandover shift = shiftHandoverService.closeShift(shiftId, closeData);
            return ResponseEntity.ok(shift);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Lấy ca đang mở của nhân viên
     * GET /api/v1/shift/current/{employeeId}
     */
    @GetMapping("/current/{employeeId}")
    public ResponseEntity<?> getCurrentShift(@PathVariable String employeeId) {
        try {
            ShiftHandover shift = shiftHandoverService.getCurrentShift(employeeId);
            return ResponseEntity.ok(shift);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Lấy lịch sử bàn giao ca của nhân viên
     * GET /api/v1/shift/history/{employeeId}
     */
    @GetMapping("/history/{employeeId}")
    public ResponseEntity<?> getEmployeeShiftHistory(@PathVariable String employeeId) {
        try {
            List<ShiftHandover> shifts = shiftHandoverService.getEmployeeShiftHistory(employeeId);
            return ResponseEntity.ok(shifts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Lấy chi tiết ca làm việc
     * GET /api/v1/shift/{shiftId}
     */
    @GetMapping("/{shiftId}")
    public ResponseEntity<?> getShiftById(@PathVariable String shiftId) {
        try {
            ShiftHandover shift = shiftHandoverService.getShiftById(shiftId);
            return ResponseEntity.ok(shift);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    // ==================== ADMIN ENDPOINTS ====================
    
    /**
     * Lấy tất cả ca làm việc (Admin)
     * GET /api/v1/shift/admin/all
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllShifts() {
        try {
            List<ShiftHandover> shifts = shiftHandoverService.getAllShifts();
            return ResponseEntity.ok(shifts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Lấy ca theo trạng thái (Admin)
     * GET /api/v1/shift/admin/status/{status}
     */
    @GetMapping("/admin/status/{status}")
    public ResponseEntity<?> getShiftsByStatus(@PathVariable String status) {
        try {
            List<ShiftHandover> shifts = shiftHandoverService.getShiftsByStatus(status);
            return ResponseEntity.ok(shifts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Đếm số ca đang chờ xác nhận (Admin)
     * GET /api/v1/shift/admin/pending-count
     */
    @GetMapping("/admin/pending-count")
    public ResponseEntity<?> countPendingShifts() {
        try {
            long count = shiftHandoverService.countPendingShifts();
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Phê duyệt bàn giao ca (Admin)
     * POST /api/v1/shift/admin/{shiftId}/approve
     */
    @PostMapping("/admin/{shiftId}/approve")
    public ResponseEntity<?> approveShift(
            @PathVariable String shiftId,
            @RequestBody Map<String, String> requestBody) {
        try {
            String adminId = requestBody.get("adminId");
            String adminName = requestBody.get("adminName");
            String adminNotes = requestBody.get("adminNotes");
            
            ShiftHandover shift = shiftHandoverService.approveShift(shiftId, adminId, adminName, adminNotes);
            return ResponseEntity.ok(shift);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Từ chối bàn giao ca (Admin)
     * POST /api/v1/shift/admin/{shiftId}/reject
     */
    @PostMapping("/admin/{shiftId}/reject")
    public ResponseEntity<?> rejectShift(
            @PathVariable String shiftId,
            @RequestBody Map<String, String> requestBody) {
        try {
            String adminId = requestBody.get("adminId");
            String adminName = requestBody.get("adminName");
            String adminNotes = requestBody.get("adminNotes");
            
            ShiftHandover shift = shiftHandoverService.rejectShift(shiftId, adminId, adminName, adminNotes);
            return ResponseEntity.ok(shift);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Thống kê bàn giao ca (Admin)
     * GET /api/v1/shift/admin/statistics
     */
    @GetMapping("/admin/statistics")
    public ResponseEntity<?> getShiftStatistics(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            LocalDateTime start = startDate != null 
                    ? LocalDateTime.parse(startDate + "T00:00:00")
                    : LocalDateTime.now().minusDays(30);
            LocalDateTime end = endDate != null 
                    ? LocalDateTime.parse(endDate + "T23:59:59")
                    : LocalDateTime.now();
            
            Map<String, Object> stats = shiftHandoverService.getShiftStatistics(start, end);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    // ==================== POS ORDER ENDPOINTS ====================
    
    /**
     * Tạo đơn hàng POS
     * POST /api/v1/shift/pos/order
     */
    @PostMapping("/pos/order")
    public ResponseEntity<?> createPOSOrder(@RequestBody Map<String, Object> orderData) {
        try {
            POSOrder order = shiftHandoverService.createPOSOrder(orderData);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Hủy đơn hàng POS
     * POST /api/v1/shift/pos/order/{orderId}/cancel
     */
    @PostMapping("/pos/order/{orderId}/cancel")
    public ResponseEntity<?> cancelPOSOrder(
            @PathVariable String orderId,
            @RequestBody Map<String, String> requestBody) {
        try {
            String reason = requestBody.get("reason");
            POSOrder order = shiftHandoverService.cancelPOSOrder(orderId, reason);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Lấy đơn hàng POS của ca
     * GET /api/v1/shift/pos/orders/{shiftId}
     */
    @GetMapping("/pos/orders/{shiftId}")
    public ResponseEntity<?> getPOSOrdersByShift(@PathVariable String shiftId) {
        try {
            List<POSOrder> orders = shiftHandoverService.getPOSOrdersByShift(shiftId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Lấy tất cả đơn hàng POS
     * GET /api/v1/shift/pos/orders
     */
    @GetMapping("/pos/orders")
    public ResponseEntity<?> getAllPOSOrders() {
        try {
            List<POSOrder> orders = shiftHandoverService.getAllPOSOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Lấy chi tiết đơn POS
     * GET /api/v1/shift/pos/order/{orderId}
     */
    @GetMapping("/pos/order/{orderId}")
    public ResponseEntity<?> getPOSOrderById(@PathVariable String orderId) {
        try {
            POSOrder order = shiftHandoverService.getPOSOrderById(orderId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Tìm kiếm sản phẩm cho POS
     * GET /api/v1/shift/pos/products/search
     */
    @GetMapping("/pos/products/search")
    public ResponseEntity<?> searchProductsForPOS(@RequestParam(required = false) String keyword) {
        try {
            List<Product> products = shiftHandoverService.searchProductsForPOS(keyword);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
