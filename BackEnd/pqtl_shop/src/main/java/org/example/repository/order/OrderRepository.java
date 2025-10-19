package org.example.repository.order;

import org.example.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    // 🔍 Tìm tất cả đơn hàng của 1 người dùng
    List<Order> findByUserId(String userId);

    // 🔍 Tìm đơn hàng theo trạng thái (VD: "Đang giao", "Đã giao", "Đã hủy")
    List<Order> findByOrderStatus(String orderStatus);

    // 🔍 Tìm đơn hàng theo trạng thái thanh toán (VD: "Đã thanh toán", "Chưa thanh toán")
    List<Order> findByPaymentStatus(String paymentStatus);

    // 🔍 Tìm đơn hàng theo phương thức thanh toán (VD: "COD", "Chuyển khoản")
    List<Order> findByPaymentMethod(String paymentMethod);
}
