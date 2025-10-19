package org.example.service.order;

import lombok.RequiredArgsConstructor;
import org.example.model.Order;
import org.example.repository.order.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    // 🟢 Tạo đơn hàng mới
    public Order createOrder(Order order) {
        order.setOrderDate(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        order.setOrderStatus("Đã xác nhận");
        order.setPaymentStatus("Chưa thanh toán");
        return orderRepository.save(order);
    }

    // 🟡 Lấy danh sách tất cả đơn hàng
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // 🟡 Lấy danh sách đơn hàng theo userId
    public List<Order> getOrdersByUser(String userId) {
        return orderRepository.findByUserId(userId);
    }

    // 🟡 Lấy đơn hàng theo id
    public Optional<Order> getOrderById(String id) {
        return orderRepository.findById(id);
    }

    // 🟠 Cập nhật thông tin đơn hàng
    public Optional<Order> updateOrder(String id, Order updatedOrder) {
        return orderRepository.findById(id).map(existing -> {
            existing.setItems(updatedOrder.getItems());
            existing.setShippingAddress(updatedOrder.getShippingAddress());
            existing.setShippingMethod(updatedOrder.getShippingMethod());
            existing.setPaymentMethod(updatedOrder.getPaymentMethod());
            existing.setOrderStatus(updatedOrder.getOrderStatus());
            existing.setPaymentStatus(updatedOrder.getPaymentStatus());
            existing.setDiscount(updatedOrder.getDiscount());
            existing.setShippingFee(updatedOrder.getShippingFee());
            existing.setFinalAmount(updatedOrder.getFinalAmount());
            existing.setUpdatedAt(LocalDateTime.now());
            return orderRepository.save(existing);
        });
    }

    // 🔴 Xóa đơn hàng theo id
    public void deleteOrder(String id) {
        orderRepository.deleteById(id);
    }

    // 🟣 Cập nhật trạng thái đơn hàng (giao, hủy, hoàn tất)
    public Optional<Order> updateOrderStatus(String id, String newStatus) {
        return orderRepository.findById(id).map(order -> {
            order.setOrderStatus(newStatus);
            order.setUpdatedAt(LocalDateTime.now());
            return orderRepository.save(order);
        });
    }

    // 🔵 Lọc đơn hàng theo trạng thái
    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByOrderStatus(status);
    }
}
