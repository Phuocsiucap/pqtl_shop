package org.example.controller.order;

import lombok.RequiredArgsConstructor;
import org.example.model.Order;
import org.example.model.login.User;
import org.example.repository.login.UserDetailsImpl;
import org.example.repository.login.UserRepository;
import org.example.service.login.UserService;
import org.example.service.order.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;
    private UserRepository userRepository;

    // 🟢 Tạo đơn hàng mới
    @PostMapping
    public ResponseEntity<?> createOrder(
            Authentication authentication,
            @RequestBody Order order) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String userId = userDetails.getId();

            order.setUserId(userId);
            Order created = orderService.createOrder(order);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 🟡 Lấy tất cả đơn hàng của user hiện tại
    @GetMapping
    public ResponseEntity<?> getUserOrders(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String userId = userDetails.getId();
            List<Order> orders = orderService.getOrdersByUser(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 🟡 Lấy đơn hàng theo ID (chỉ user chủ sở hữu hoặc admin mới lấy được)
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(
            Authentication authentication,
            @PathVariable String id) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String userId = userDetails.getId();
            Optional<Order> orderOpt = orderService.getOrderById(id);
            if (orderOpt.isPresent() && orderOpt.get().getUserId().equals(userId)) {
                return ResponseEntity.ok(orderOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 🟠 Cập nhật đơn hàng (chỉ user chủ sở hữu mới cập nhật được)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrder(
            Authentication authentication,
            @PathVariable String id,
            @RequestBody Order order) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String userId = userDetails.getId();
            Optional<Order> result = orderService.updateOrder(id, order, userId);
            if (result.isPresent()) {
                return ResponseEntity.ok(result.get());
            } else {
                return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền cập nhật đơn hàng này"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 🔵 Cập nhật trạng thái đơn hàng (chỉ user chủ sở hữu mới cập nhật được)
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            Authentication authentication,
            @PathVariable String id,
            @RequestParam String status) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String userId = userDetails.getId();
            Optional<Order> result = orderService.updateOrderStatus(id, status, userId);
            if (result.isPresent()) {
                return ResponseEntity.ok(result.get());
            } else {
                return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền cập nhật đơn hàng này"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 🔴 Xóa đơn hàng (chỉ user chủ sở hữu mới xóa được)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(
            Authentication authentication,
            @PathVariable String id) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String userId = userDetails.getId();
            boolean deleted = orderService.deleteOrder(id, userId);
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền xóa đơn hàng này"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 🟣 Lấy danh sách đơn hàng theo trạng thái (chỉ admin)
    @GetMapping("/status")
    public ResponseEntity<?> getOrdersByStatus(@RequestParam String status) {
        try {
            List<Order> orders = orderService.getOrdersByStatus(status);
             return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Hỗ trợ admin: Lấy tất cả đơn hàng (cần check role)
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllOrdersAdmin(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            // TODO: Kiểm tra nếu user là ADMIN thì mới cho lấy
            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền truy cập"));
            }
            List<Order> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Hỗ trợ admin: Lấy đơn hàng của user bất kỳ
    @GetMapping("/admin/user/{userId}")
    public ResponseEntity<?> getOrdersByUserAdmin(
            Authentication authentication,
            @PathVariable String userId) {
        try {
            User user = (User) authentication.getPrincipal();
            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền truy cập"));
            }
            List<Order> orders = orderService.getOrdersByUser(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Hỗ trợ admin: Cập nhật trạng thái đơn hàng của user bất kỳ
    @PatchMapping("/admin/{id}/status")
    public ResponseEntity<?> updateOrderStatusAdmin(
            Authentication authentication,
            @PathVariable String id,
            @RequestParam String status) {
        try {
            User user = (User) authentication.getPrincipal();
            if (!"ADMIN".equals(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền truy cập"));
            }
            return orderService.getOrderById(id)
                    .map(order -> {
                        orderService.updateOrderStatusDirect(id, status);
                        return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái thành công"));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private String extractUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }
}