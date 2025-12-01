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
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        try {
            Product product = adminService.createProduct(goodJson, imageFile);
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
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        try {
            Product product = adminService.updateProduct(id, goodJson, imageFile);
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
}
