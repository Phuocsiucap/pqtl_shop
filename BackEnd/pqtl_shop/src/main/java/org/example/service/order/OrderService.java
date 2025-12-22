package org.example.service.order;

import lombok.RequiredArgsConstructor;
import org.example.model.Order;
import org.example.model.OrderItem;
import org.example.model.Product;
import org.example.model.UserVoucher;
import org.example.model.Voucher;
import org.example.repository.ProductRepository;
import org.example.repository.UserVoucherRepository;
import org.example.repository.VoucherRepository;
import org.example.repository.order.OrderRepository;
import org.example.service.CartService;
import org.example.service.VoucherService;
import org.example.service.login.UserService;
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
    private final UserService userService;
    private final VoucherRepository voucherRepository;
    private final UserVoucherRepository userVoucherRepository;
    private final VoucherService voucherService;

    // 🟢 Tạo đơn hàng mới
    public Order createOrder(Order order) {
        if (order.getUserId() == null || order.getUserId().isEmpty()) {
            throw new IllegalArgumentException("UserId là bắt buộc");
        }

        System.out.println("Creating order for user: " + order.getUserId());
        System.out.println("Order items count: " + (order.getItems() != null ? order.getItems().size() : "null"));

        order.setOrderDate(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        order.setOrderStatus("Đã xác nhận");
        order.setPaymentStatus("Chưa thanh toán");
        order.setChannel("ONLINE"); // Xác định nguồn đơn hàng

        // Lưu costPrice cho mỗi OrderItem từ Product
        double totalProfit = 0;
        for (OrderItem item : order.getItems()) {
            System.out.println("Processing item: " + item.getProductName() + ", qty: " + item.getQuantity());
            Optional<Product> productOpt = productRepository.findById(item.getProductId());
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                // Xử lý costPrice có thể null
                Double productCostPrice = product.getCostPrice() != null ? product.getCostPrice() : 0.0;
                item.setCostPrice(productCostPrice);
                item.setImage(product.getImage()); // Thêm image từ product
                // Tính lợi nhuận: (giá bán - giảm giá - giá nhập) * số lượng
                double itemProfit = (item.getPrice() - item.getDiscount() - productCostPrice) * item.getQuantity();
                totalProfit += itemProfit;
            }
        }
        order.setTotalProfit(totalProfit);

        // Áp dụng voucher nếu có
        UserVoucher userVoucher = null;
        if (order.getUserVoucherId() != null && !order.getUserVoucherId().isEmpty()) {
            Optional<UserVoucher> userVoucherOpt = userVoucherRepository.findById(order.getUserVoucherId());
            if (userVoucherOpt.isPresent()) {
                userVoucher = userVoucherOpt.get();
                if (!userVoucher.getUserId().equals(order.getUserId())) {
                    throw new IllegalArgumentException("Voucher không thuộc về người dùng này");
                }
                if (userVoucher.getIsUsed()) {
                    throw new IllegalArgumentException("Voucher đã được sử dụng");
                }
                Optional<Voucher> voucherOpt = voucherRepository.findById(userVoucher.getVoucherId());
                if (voucherOpt.isPresent()) {
                    Voucher voucher = voucherOpt.get();
                    if (order.getTotalPrice() < voucher.getMinOrderValue()) {
                        throw new IllegalArgumentException("Đơn hàng không đủ giá trị tối thiểu để áp dụng voucher");
                    }
                    // Check usage limit
                    if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
                        throw new IllegalArgumentException("Voucher đã hết lượt sử dụng");
                    }
                    double discount = 0;
                    if ("PERCENTAGE".equals(voucher.getDiscountType())) {
                        discount = (voucher.getDiscountValue() / 100) * order.getTotalPrice();
                        if (voucher.getMaxDiscountAmount() != null && discount > voucher.getMaxDiscountAmount()) {
                            discount = voucher.getMaxDiscountAmount();
                        }
                    } else if ("FIXED_AMOUNT".equals(voucher.getDiscountType())) {
                        discount = voucher.getDiscountValue();
                    }
                    order.setDiscount(discount);
                    // Voucher will be marked as used after order is saved
                }
            }
        }

        // Tính toán finalAmount
        double finalAmount = order.getTotalPrice() - order.getDiscount() + order.getShippingFee();
        order.setFinalAmount(finalAmount);
        
        // 🧹 Xóa từng sản phẩm trong đơn hàng khỏi giỏ
        for (OrderItem item : order.getItems()) {
            cartService.removeItemFromCart(order.getUserId(), item.getProductId());
        }

        Order savedOrder = orderRepository.save(order);
        System.out.println("Order saved with ID: " + savedOrder.getId() + ", items count: " + (savedOrder.getItems() != null ? savedOrder.getItems().size() : "null"));
        
        // Use voucher after order is saved
        if (userVoucher != null) {
            Voucher voucher = voucherRepository.findById(userVoucher.getVoucherId()).orElse(null);
            if (voucher != null) {
                voucherService.useVoucher(order.getUserId(), voucher.getCode(), savedOrder.getId());
            }
        }
        
        return savedOrder;
    }

    // 🟡 Lấy danh sách tất cả đơn hàng (chỉ admin)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // 🟡 Lấy danh sách đơn hàng theo userId (sắp xếp theo thời gian mới nhất)
    public List<Order> getOrdersByUser(String userId) {
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("UserId không được để trống");
        }
        List<Order> orders = orderRepository.findByUserId(userId);
        // Sắp xếp theo orderDate giảm dần (mới nhất trước)
        orders.sort((a, b) -> b.getOrderDate().compareTo(a.getOrderDate()));
        return orders;
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
            
            // Chỉ cho phép xóa nếu đơn hàng ở trạng thái "Đã xác nhận", "Hủy" hoặc "Đã hủy"
            if (!"Đã xác nhận".equals(status) && !"Hủy".equals(status) && !"Đã hủy".equals(status)) {
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

            // Validation đặc biệt cho hủy đơn hàng
            if ("Hủy".equals(newStatus) || "Đã hủy".equals(newStatus)) {
                String currentStatus = order.getOrderStatus();
                if ("Đã giao".equals(currentStatus) || "Hủy".equals(currentStatus) || "Đã hủy".equals(currentStatus)) {
                    throw new IllegalStateException("Không thể hủy đơn hàng ở trạng thái: " + currentStatus);
                }
            }

            order.setOrderStatus(newStatus);

            // Nếu đơn hàng hoàn tất, ghi nhận thời gian
            if ("Đã giao".equals(newStatus)) {
                order.setCompletedAt(LocalDateTime.now());
            }

            order.setUpdatedAt(LocalDateTime.now());
            Order savedOrder = orderRepository.save(order);

            // Thêm điểm thưởng nếu đơn hàng đã giao
            if ("Đã giao".equals(newStatus)) {
                int points = (int) (savedOrder.getFinalAmount() * 0.05);
                System.out.println("Cộng " + points + " điểm cho user " + savedOrder.getUserId() + " cho đơn hàng " + savedOrder.getId());
                userService.addPoints(savedOrder.getUserId(), points);
                // Cập nhật trạng thái thanh toán khi đơn hàng đã giao
                savedOrder.setPaymentStatus("Đã thanh toán");
                savedOrder = orderRepository.save(savedOrder);
                System.out.println("Đã cập nhật paymentStatus thành 'Đã thanh toán' cho đơn hàng " + savedOrder.getId());
            }

            return Optional.of(savedOrder);
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

            // Validation đặc biệt cho hủy đơn hàng
            if ("Hủy".equals(newStatus) || "Đã hủy".equals(newStatus)) {
                String currentStatus = order.getOrderStatus();
                if ("Đã giao".equals(currentStatus) || "Hủy".equals(currentStatus) || "Đã hủy".equals(currentStatus)) {
                    throw new IllegalStateException("Không thể hủy đơn hàng ở trạng thái: " + currentStatus);
                }
            }

            order.setOrderStatus(newStatus);

            // Nếu đơn hàng hoàn tất, ghi nhận thời gian
            if ("Đã giao".equals(newStatus)) {
                order.setCompletedAt(LocalDateTime.now());
            }

            order.setUpdatedAt(LocalDateTime.now());
            Order savedOrder = orderRepository.save(order);

            // Thêm điểm thưởng nếu đơn hàng đã giao
            if ("Đã giao".equals(newStatus)) {
                int points = (int) (savedOrder.getFinalAmount() * 0.05);
                System.out.println("Cộng " + points + " điểm cho user " + savedOrder.getUserId() + " cho đơn hàng " + savedOrder.getId());
                userService.addPoints(savedOrder.getUserId(), points);
                // Cập nhật trạng thái thanh toán khi đơn hàng đã giao
                savedOrder.setPaymentStatus("Đã thanh toán");
                savedOrder = orderRepository.save(savedOrder);
                System.out.println("Đã cập nhật paymentStatus thành 'Đã thanh toán' cho đơn hàng " + savedOrder.getId());
            }

            return savedOrder;
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