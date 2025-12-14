package org.example.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Entity cho đơn hàng bán trực tiếp tại quầy (POS - Point of Sale)
 */
@Data
@Document(collection = "pos_orders")
public class POSOrder {
    @Id
    private String id;
    
    // Mã đơn hàng POS (format: POS-YYYYMMDD-XXXX)
    private String posOrderCode;
    
    // Thông tin nhân viên bán hàng
    private String employeeId;
    private String employeeName;
    
    // Thông tin ca làm việc
    private String shiftHandoverId;           // Liên kết với ca làm việc
    
    // Thông tin khách hàng (có thể để trống nếu khách vãng lai)
    private String customerId;
    private String customerName;
    private String customerPhone;
    
    // Danh sách sản phẩm
    private List<POSOrderItem> items;
    
    // Tổng tiền
    private double subtotal;                  // Tổng tiền trước giảm giá
    private double discount;                  // Giảm giá
    private double totalAmount;               // Tổng tiền sau giảm giá
    
    // Thanh toán
    private String paymentMethod;             // "CASH", "BANK_TRANSFER", "EWALLET"
    private double amountReceived;            // Tiền khách đưa
    private double changeAmount;              // Tiền thối lại
    
    // Trạng thái
    private String status;                    // "COMPLETED", "CANCELLED", "RETURNED"
    
    // Ghi chú
    private String notes;
    
    // Thời gian
    private LocalDateTime orderTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    /**
     * Inner class cho item trong đơn POS
     */
    @Data
    public static class POSOrderItem {
        private String productId;
        private String productName;
        private String productImage;
        private double unitPrice;             // Giá bán
        private double costPrice;             // Giá nhập (để tính lợi nhuận)
        private int quantity;
        private double discount;              // Giảm giá cho item
        private double totalPrice;            // = (unitPrice - discount) * quantity
        private double profit;                // = (unitPrice - costPrice - discount) * quantity
    }
    
    /**
     * Tính tổng lợi nhuận
     */
    public double getTotalProfit() {
        if (items == null || items.isEmpty()) {
            return 0;
        }
        return items.stream()
                .mapToDouble(POSOrderItem::getProfit)
                .sum();
    }
}
