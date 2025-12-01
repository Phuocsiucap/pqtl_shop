package org.example.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "orders")
public class Order {
    @Id
    private String id;

    private String userId;                    // ID người dùng (liên kết với bảng User)
    private List<OrderItem> items;            // Danh sách sản phẩm trong đơn hàng
    private double totalPrice;                // Tổng tiền trước giảm giá (doanh thu)
    private double discount;                  // Mức giảm giá (nếu có)
    private double shippingFee;               // Phí vận chuyển
    private double finalAmount;               // Tổng cuối cùng phải trả = totalPrice - discount + shippingFee
    private double totalProfit;               // Tổng lợi nhuận của đơn hàng = sum((giá bán - giá nhập) * quantity)

    private String shippingAddress;           // Địa chỉ giao hàng
    private String shippingMethod;            // Phương thức giao hàng: "Nhanh", "Tiết kiệm", "Tiêu chuẩn"
    private String paymentMethod;             // Phương thức thanh toán: "COD", "Chuyển khoản", "Ví điện tử", "Thẻ ngân hàng"
    private String paymentStatus;             // "Chưa thanh toán", "Đã thanh toán", "Hoàn tiền"
    private String orderStatus;               // "Đã xác nhận", "Đang giao", "Đã giao", "Đã hủy"

    private LocalDateTime orderDate;          // Ngày đặt hàng
    private LocalDateTime updatedAt;          // Ngày cập nhật đơn hàng

    private String note;                      // Ghi chú của khách hàng (nếu có)
    private String adminNote;                 // Ghi chú nội bộ (nếu là admin thêm)
    
    // Thêm order_id - cần thiết cho admin API truy vấn/cập nhật đơn hàng
    private String order_id;
    // Thêm shipping_status - cần thiết cho admin API quản lý trạng thái giao hàng
    private String shipping_status = "Chờ xác nhận";  // Giá trị mặc định
    
    // Tính lợi nhuận từ các items (nếu totalProfit chưa được set)
    public double getTotalProfit() {
        if (totalProfit > 0 || items == null) {
            return totalProfit;
        }
        return items.stream()
                .mapToDouble(OrderItem::getProfit)
                .sum();
    }
}
