package org.example.repository.order;

import org.example.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {

    // Tìm tất cả đơn hàng của một user
    List<Order> findByUserId(String userId);

    // Tìm đơn hàng theo trạng thái
    List<Order> findByOrderStatus(String orderStatus);

    // Tìm đơn hàng theo trạng thái thanh toán
    List<Order> findByPaymentStatus(String paymentStatus);

    // Tìm tất cả đơn hàng của user với trạng thái cụ thể
    List<Order> findByUserIdAndOrderStatus(String userId, String orderStatus);

    // Tìm tất cả đơn hàng của user với trạng thái thanh toán cụ thể
    List<Order> findByUserIdAndPaymentStatus(String userId, String paymentStatus);

    // Đếm số đơn hàng của user
    long countByUserId(String userId);

    // Đếm số đơn hàng với trạng thái cụ thể
    long countByOrderStatus(String orderStatus);
}