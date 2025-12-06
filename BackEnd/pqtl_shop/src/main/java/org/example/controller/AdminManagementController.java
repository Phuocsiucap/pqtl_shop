package org.example.controller;

import org.example.model.Order;
import org.example.model.Product;
import org.example.model.login.User;
import org.example.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin(origins = "*")
public class AdminManagementController {

    @Autowired
    private AdminService adminService;

    // ==================== AUTHENTICATION ====================
    /**
     * Admin login
     * POST /api/v1/admin/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> adminLogin(@RequestBody Map<String, String> credentials) {
        try {
            String username = credentials.get("username");
            String password = credentials.get("password");
            
            Map<String, Object> response = adminService.adminLogin(username, password);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Đăng nhập thất bại: " + e.getMessage()));
        }
    }

    // ==================== USER MANAGEMENT ====================
    /**
     * Get all users
     * GET /api/v1/admin/users/
     */
    @GetMapping("/users/")
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = adminService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Delete user by ID
     * DELETE /api/v1/admin/users/{id}/
     */
    @DeleteMapping("/users/{id}/")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        try {
            adminService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "Xóa người dùng thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Xóa thất bại: " + e.getMessage()));
        }
    }

    // ==================== PRODUCT MANAGEMENT ====================
    /**
     * Get all products
     * GET /api/v1/admin/goods/
     */
    @GetMapping("/goods/")
    public ResponseEntity<List<Product>> getAllProducts() {
        try {
            List<Product> products = adminService.getAllProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Create new product with image upload
     * POST /api/v1/admin/goods/
     */
    @PostMapping("/goods/")
    public ResponseEntity<?> createProduct(
            @RequestParam("good") String goodJson,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "additionalImages", required = false) MultipartFile[] additionalImages) {
        try {
            Product product = adminService.createProduct(goodJson, imageFile, additionalImages);
            return ResponseEntity.status(HttpStatus.CREATED).body(product);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Lỗi khi xử lý ảnh: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Thêm sản phẩm thất bại: " + e.getMessage()));
        }
    }

    /**
     * Update product
     * PUT /api/v1/admin/goods/{id}/
     */
    @PutMapping("/goods/{id}/")
    public ResponseEntity<?> updateProduct(
            @PathVariable String id,
            @RequestParam("good") String goodJson,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "additionalImages", required = false) MultipartFile[] additionalImages) {
        try {
            Product product = adminService.updateProduct(id, goodJson, imageFile, additionalImages);
            return ResponseEntity.ok(product);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Lỗi khi xử lý ảnh: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Cập nhật sản phẩm thất bại: " + e.getMessage()));
        }
    }

    /**
     * Delete product by ID
     * DELETE /api/v1/admin/goods/{id}/
     */
    @DeleteMapping("/goods/{id}/")
    public ResponseEntity<?> deleteProduct(@PathVariable String id) {
        try {
            adminService.deleteProduct(id);
            return ResponseEntity.ok(Map.of("message", "Xóa sản phẩm thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Xóa thất bại: " + e.getMessage()));
        }
    }

    // ==================== ORDER MANAGEMENT ====================
    /**
     * Get all orders
     * GET /api/v1/admin/orders/
     */
    @GetMapping("/orders/")
    public ResponseEntity<List<Order>> getAllOrders() {
        try {
            List<Order> orders = adminService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Get order details with goods
     * GET /api/v1/admin/orders/{orderId}/goods/
     */
    @GetMapping("/orders/{orderId}/goods/")
    public ResponseEntity<?> getOrderDetails(@PathVariable String orderId) {
        try {
            Order order = adminService.getOrderDetails(orderId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Không tìm thấy đơn hàng: " + e.getMessage()));
        }
    }

    /**
     * Update order status
     * PATCH /api/v1/admin/orders/{orderId}/
     */
    @PatchMapping("/orders/{orderId}/")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody Map<String, String> requestBody) {
        try {
            String shippingStatus = requestBody.get("shipping_status");
            Order order = adminService.updateOrderStatus(orderId, shippingStatus);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Cập nhật trạng thái thất bại: " + e.getMessage()));
        }
    }

    // ==================== DASHBOARD/STATISTICS ====================
    /**
     * Get today's revenue
     * GET /api/v1/admin/today-revenue/
     */
    @GetMapping("/today-revenue/")
    public ResponseEntity<?> getTodayRevenue() {
        try {
            Map<String, Object> revenue = adminService.getTodayRevenue();
            return ResponseEntity.ok(revenue);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi khi lấy dữ liệu: " + e.getMessage()));
        }
    }

    /**
     * Get monthly revenue
     * GET /api/v1/admin/revenue/monthly/
     */
    @GetMapping("/revenue/monthly/")
    public ResponseEntity<?> getMonthlyRevenue() {
        try {
            List<Map<String, Object>> revenue = adminService.getMonthlyRevenue();
            return ResponseEntity.ok(revenue);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi khi lấy dữ liệu: " + e.getMessage()));
        }
    }

    /**
     * Get weekly revenue
     * GET /api/v1/admin/revenue/weekly/
     */
    @GetMapping("/revenue/weekly/")
    public ResponseEntity<?> getWeeklyRevenue() {
        try {
            List<Map<String, Object>> revenue = adminService.getWeeklyRevenue();
            return ResponseEntity.ok(revenue);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi khi lấy dữ liệu: " + e.getMessage()));
        }
    }

    // ==================== BEST SELLER ====================
    /**
     * Get best seller products
     * GET /api/v1/admin/bestsellers/
     */
    @GetMapping("/bestsellers/")
    public ResponseEntity<?> getBestSellers(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            java.time.LocalDateTime start = startDate != null ? java.time.LocalDateTime.parse(startDate) : null;
            java.time.LocalDateTime end = endDate != null ? java.time.LocalDateTime.parse(endDate) : null;
            
            List<Map<String, Object>> bestsellers = adminService.getBestSellerProducts(limit, period, start, end);
            return ResponseEntity.ok(bestsellers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi khi lấy dữ liệu: " + e.getMessage()));
        }
    }

    /**
     * Get product revenue stats
     * GET /api/v1/admin/products/{productId}/revenue/
     */
    @GetMapping("/products/{productId}/revenue/")
    public ResponseEntity<?> getProductRevenueStats(
            @PathVariable String productId,
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            java.time.LocalDateTime start = startDate != null ? java.time.LocalDateTime.parse(startDate) : null;
            java.time.LocalDateTime end = endDate != null ? java.time.LocalDateTime.parse(endDate) : null;
            
            Map<String, Object> stats = adminService.getProductRevenueStats(productId, period, start, end);
            if (stats == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Không tìm thấy sản phẩm"));
            }
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi khi lấy dữ liệu: " + e.getMessage()));
        }
    }

    /**
     * Get order stats by status
     * GET /api/v1/admin/orders/stats/
     */
    @GetMapping("/orders/stats/")
    public ResponseEntity<?> getOrderStats() {
        try {
            Map<String, Object> stats = adminService.getOrderStatsByStatus();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi khi lấy dữ liệu: " + e.getMessage()));
        }
    }

    /**
     * Get financial report (profit statistics)
     * GET /api/v1/admin/financial-report/
     */
    @GetMapping("/financial-report/")
    public ResponseEntity<?> getFinancialReport(
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            java.time.LocalDateTime start = startDate != null ? java.time.LocalDateTime.parse(startDate) : null;
            java.time.LocalDateTime end = endDate != null ? java.time.LocalDateTime.parse(endDate) : null;
            
            Map<String, Object> report = adminService.getFinancialReport(period, start, end);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi khi lấy báo cáo: " + e.getMessage()));
        }
    }

    /**
     * Get top profit products (high and low)
     * GET /api/v1/admin/products/profit-ranking/
     */
    @GetMapping("/products/profit-ranking/")
    public ResponseEntity<?> getProductsProfitRanking(
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            Map<String, Object> ranking = adminService.getProductsProfitRanking(period, limit);
            return ResponseEntity.ok(ranking);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi khi lấy dữ liệu: " + e.getMessage()));
        }
    }

    /**
     * Update user (admin only)
     * PUT /api/v1/admin/users/{id}/
     */
    @PutMapping("/users/{id}/")
    public ResponseEntity<?> updateUser(
            @PathVariable String id,
            @RequestBody Map<String, Object> updates,
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Lấy admin ID từ token (simplified - trong thực tế cần parse JWT)
            String adminId = "admin"; // Placeholder - cần lấy từ JWT
            
            User user = adminService.updateUser(id, updates, adminId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            if (e.getMessage().contains("không có quyền")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Cập nhật thất bại: " + e.getMessage()));
        }
    }

    // ==================== EXPIRY & CLEARANCE MANAGEMENT ====================
    
    /**
     * Lấy thống kê sản phẩm theo trạng thái hết hạn
     * GET /api/v1/admin/expiry/stats/
     */
    @GetMapping("/expiry/stats/")
    public ResponseEntity<?> getExpiryStatistics() {
        try {
            Map<String, Object> stats = adminService.getExpiryStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi khi lấy thống kê: " + e.getMessage()));
        }
    }
    
    /**
     * Lấy danh sách sản phẩm đã hết hạn
     * GET /api/v1/admin/expiry/expired/
     */
    @GetMapping("/expiry/expired/")
    public ResponseEntity<?> getExpiredProducts() {
        try {
            List<Product> products = adminService.getExpiredProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi khi lấy dữ liệu: " + e.getMessage()));
        }
    }
    
    /**
     * Lấy danh sách sản phẩm sắp hết hạn
     * GET /api/v1/admin/expiry/near-expiry/?days=30
     */
    @GetMapping("/expiry/near-expiry/")
    public ResponseEntity<?> getNearExpiryProducts(
            @RequestParam(defaultValue = "30") int days) {
        try {
            List<Product> products = adminService.getNearExpiryProducts(days);
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi khi lấy dữ liệu: " + e.getMessage()));
        }
    }
    
    /**
     * Đánh dấu sản phẩm thanh lý
     * POST /api/v1/admin/clearance/{id}/
     */
    @PostMapping("/clearance/{id}/")
    public ResponseEntity<?> markProductAsClearance(
            @PathVariable String id,
            @RequestParam(defaultValue = "30") Double discount) {
        try {
            Product product = adminService.markProductAsClearance(id, discount);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi: " + e.getMessage()));
        }
    }
    
    /**
     * Hủy đánh dấu thanh lý sản phẩm
     * DELETE /api/v1/admin/clearance/{id}/
     */
    @DeleteMapping("/clearance/{id}/")
    public ResponseEntity<?> unmarkProductAsClearance(@PathVariable String id) {
        try {
            Product product = adminService.unmarkProductAsClearance(id);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi: " + e.getMessage()));
        }
    }
    
    /**
     * Lấy danh sách sản phẩm đang thanh lý
     * GET /api/v1/admin/clearance/
     */
    @GetMapping("/clearance/")
    public ResponseEntity<?> getClearanceProducts() {
        try {
            List<Product> products = adminService.getClearanceProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi khi lấy dữ liệu: " + e.getMessage()));
        }
    }
    
    /**
     * Tự động đánh dấu thanh lý cho sản phẩm sắp hết hạn
     * POST /api/v1/admin/clearance/auto-mark/
     */
    @PostMapping("/clearance/auto-mark/")
    public ResponseEntity<?> autoMarkClearance(
            @RequestParam(defaultValue = "30") int daysThreshold,
            @RequestParam(defaultValue = "30") Double discount) {
        try {
            Map<String, Object> result = adminService.autoMarkClearanceForNearExpiryProducts(daysThreshold, discount);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi: " + e.getMessage()));
        }
    }
    
    /**
     * Xóa/Vô hiệu hóa sản phẩm đã hết hạn
     * POST /api/v1/admin/expiry/remove-expired/
     */
    @PostMapping("/expiry/remove-expired/")
    public ResponseEntity<?> removeExpiredProducts(
            @RequestParam(defaultValue = "false") boolean hardDelete) {
        try {
            Map<String, Object> result = adminService.removeExpiredProducts(hardDelete);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi: " + e.getMessage()));
        }
    }
    
    /**
     * Lấy danh sách sản phẩm theo lô
     * GET /api/v1/admin/products/batches/
     */
    @GetMapping("/products/batches/")
    public ResponseEntity<?> getProductsByBatch() {
        try {
            Map<String, List<Product>> batches = adminService.getProductsByBatch();
            return ResponseEntity.ok(batches);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi: " + e.getMessage()));
        }
    }
}
