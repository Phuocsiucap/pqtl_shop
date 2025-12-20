package org.example.service.order;

import lombok.RequiredArgsConstructor;
import org.example.model.Order;
import org.example.model.OrderItem;
import org.example.model.Product;
import org.example.repository.ProductRepository;
import org.example.repository.order.OrderRepository;
import org.example.service.CartService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final ProductRepository productRepository;

    // 🟢 Tạo đơn hàng mới
    public Order createOrder(Order order) {
        if (order.getUserId() == null || order.getUserId().isEmpty()) {
            throw new IllegalArgumentException("UserId là bắt buộc");
        }

        order.setOrderDate(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        if (order.getOrderStatus() == null || order.getOrderStatus().isEmpty()) {
            order.setOrderStatus("Chờ xác nhận");
        }
        order.setPaymentStatus("Chưa thanh toán");

        // Lưu costPrice cho mỗi OrderItem từ Product
        double totalProfit = 0;
        for (OrderItem item : order.getItems()) {
            Optional<Product> productOpt = productRepository.findById(item.getProductId());
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                // Xử lý costPrice có thể null
                Double productCostPrice = product.getCostPrice() != null ? product.getCostPrice() : 0.0;
                item.setCostPrice(productCostPrice);
                // Tính lợi nhuận: (giá bán - giảm giá - giá nhập) * số lượng
                double itemProfit = (item.getPrice() - item.getDiscount() - productCostPrice) * item.getQuantity();
                totalProfit += itemProfit;
            }
        }
        order.setTotalProfit(totalProfit);

        // Tính toán finalAmount
        double finalAmount = order.getTotalPrice() - order.getDiscount() + order.getShippingFee();
        order.setFinalAmount(finalAmount);
        
        // 🧹 Xóa từng sản phẩm trong đơn hàng khỏi giỏ
        for (OrderItem item : order.getItems()) {
            cartService.removeItemFromCart(order.getUserId(), item.getProductId());
        }

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

            // Lấy trạng thái từ cả orderStatus và shipping_status
            String status = order.getOrderStatus() != null ? order.getOrderStatus() : order.getShipping_status();
            
            // Chỉ cho phép xóa nếu đơn hàng ở trạng thái "Chờ xác nhận"
            if (!"Chờ xác nhận".equals(status)) {
                throw new IllegalStateException("Không thể xóa đơn hàng ở trạng thái: " + status);
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
        return status.equals("Chờ xác nhận") ||
                status.equals("Đã xác nhận") ||
                status.equals("Đang giao") ||
                status.equals("Đã giao") ||
                status.equals("Hủy") ||
                status.equals("Đã hủy");
    }

    // 📊 Bonus: Lấy thống kê đơn hàng của user
    public Map<String, Object> getUserOrderStats(String userId) {
        List<Order> orders = getOrdersByUser(userId);
        long totalOrders = orders.size();
        long deliveredOrders = orders.stream().filter(o -> 
            "Đã giao".equals(o.getOrderStatus()) || "Đã giao".equals(o.getShipping_status())).count();
        long cancelledOrders = orders.stream().filter(o -> 
            "Hủy".equals(o.getOrderStatus()) || "Hủy".equals(o.getShipping_status()) ||
            "Đã hủy".equals(o.getOrderStatus()) || "Đã hủy".equals(o.getShipping_status())).count();
        double totalSpent = orders.stream().mapToDouble(Order::getFinalAmount).sum();

        return Map.of(
                "totalOrders", totalOrders,
                "deliveredOrders", deliveredOrders,
                "cancelledOrders", cancelledOrders,
                "totalSpent", totalSpent
        );
    }
}