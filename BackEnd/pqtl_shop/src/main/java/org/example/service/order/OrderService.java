package org.example.service.order;

import lombok.RequiredArgsConstructor;
import org.example.model.Order;
import org.example.repository.order.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    // 🟢 Tạo đơn hàng mới
    public Order createOrder(Order order) {
        if (order.getUserId() == null || order.getUserId().isEmpty()) {
            throw new IllegalArgumentException("UserId là bắt buộc");
        }

        order.setOrderDate(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        order.setOrderStatus("Đã xác nhận");
        order.setPaymentStatus("Chưa thanh toán");

        // Tính toán finalAmount
        double finalAmount = order.getTotalPrice() - order.getDiscount() + order.getShippingFee();
        order.setFinalAmount(finalAmount);

        return orderRepository.save(order);
    }

    // 🟡 Lấy danh sách tất cả đơn hàng (chỉ admin)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // 🟡 Lấy danh sách đơn hàng theo userId
    public List<Order> getOrdersByUser(String userId) {
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("UserId không được để trống");
        }
        return orderRepository.findByUserId(userId);
    }

    // 🟡 Lấy đơn hàng theo id
    public Optional<Order> getOrderById(String id) {
        if (id == null || id.isEmpty()) {
            throw new IllegalArgumentException("OrderId không được để trống");
        }
        return orderRepository.findById(id);
    }

    // 🟠 Cập nhật thông tin đơn hàng (kiểm tra quyền user)
    public Optional<Order> updateOrder(String id, Order updatedOrder, String userId) {
        return orderRepository.findById(id).flatMap(existing -> {
            // Kiểm tra xem user có phải chủ sở hữu đơn hàng không
            if (!existing.getUserId().equals(userId)) {
                return Optional.empty();
            }

            existing.setItems(updatedOrder.getItems());
            existing.setShippingAddress(updatedOrder.getShippingAddress());
            existing.setShippingMethod(updatedOrder.getShippingMethod());
            existing.setPaymentMethod(updatedOrder.getPaymentMethod());
            existing.setDiscount(updatedOrder.getDiscount());
            existing.setShippingFee(updatedOrder.getShippingFee());

            // Tính toán lại finalAmount
            double finalAmount = existing.getTotalPrice() - existing.getDiscount() + existing.getShippingFee();
            existing.setFinalAmount(finalAmount);

            existing.setNote(updatedOrder.getNote());
            existing.setUpdatedAt(LocalDateTime.now());

            return Optional.of(orderRepository.save(existing));
        });
    }

    // 🔴 Xóa đơn hàng theo id (kiểm tra quyền user)
    public boolean deleteOrder(String id, String userId) {
        return orderRepository.findById(id).map(order -> {
            // Kiểm tra xem user có phải chủ sở hữu đơn hàng không
            if (!order.getUserId().equals(userId)) {
                return false;
            }

            // Chỉ cho phép xóa nếu đơn hàng ở trạng thái "Đã xác nhận" hoặc "Đã hủy"
            if (!order.getOrderStatus().equals("Đã xác nhận") && !order.getOrderStatus().equals("Đã hủy")) {
                throw new IllegalStateException("Không thể xóa đơn hàng ở trạng thái: " + order.getOrderStatus());
            }

            orderRepository.deleteById(id);
            return true;
        }).orElse(false);
    }

    // 🟣 Cập nhật trạng thái đơn hàng (kiểm tra quyền user)
    public Optional<Order> updateOrderStatus(String id, String newStatus, String userId) {
        return orderRepository.findById(id).flatMap(order -> {
            // Kiểm tra xem user có phải chủ sở hữu đơn hàng không
            if (!order.getUserId().equals(userId)) {
                return Optional.empty();
            }

            // Validate trạng thái
            if (!isValidOrderStatus(newStatus)) {
                throw new IllegalArgumentException("Trạng thái không hợp lệ: " + newStatus);
            }

            order.setOrderStatus(newStatus);
            order.setUpdatedAt(LocalDateTime.now());
            return Optional.of(orderRepository.save(order));
        });
    }

    // 🔵 Lọc đơn hàng theo trạng thái
    public List<Order> getOrdersByStatus(String status) {
        if (status == null || status.isEmpty()) {
            throw new IllegalArgumentException("Status không được để trống");
        }
        return orderRepository.findByOrderStatus(status);
    }

    // 🟣 Helper: Admin cập nhật trạng thái trực tiếp (không kiểm tra quyền)
    public Optional<Order> updateOrderStatusDirect(String id, String newStatus) {
        return orderRepository.findById(id).map(order -> {
            if (!isValidOrderStatus(newStatus)) {
                throw new IllegalArgumentException("Trạng thái không hợp lệ: " + newStatus);
            }
            order.setOrderStatus(newStatus);
            order.setUpdatedAt(LocalDateTime.now());
            return orderRepository.save(order);
        });
    }

    // 🟣 Helper: Validate trạng thái đơn hàng
    private boolean isValidOrderStatus(String status) {
        return status.equals("Đã xác nhận") ||
                status.equals("Đang giao") ||
                status.equals("Đã giao") ||
                status.equals("Đã hủy");
    }

    // 📊 Bonus: Lấy thống kê đơn hàng của user
    public Map<String, Object> getUserOrderStats(String userId) {
        List<Order> orders = getOrdersByUser(userId);
        long totalOrders = orders.size();
        long deliveredOrders = orders.stream().filter(o -> o.getOrderStatus().equals("Đã giao")).count();
        long cancelledOrders = orders.stream().filter(o -> o.getOrderStatus().equals("Đã hủy")).count();
        double totalSpent = orders.stream().mapToDouble(Order::getFinalAmount).sum();

        return Map.of(
                "totalOrders", totalOrders,
                "deliveredOrders", deliveredOrders,
                "cancelledOrders", cancelledOrders,
                "totalSpent", totalSpent
        );
    }
}