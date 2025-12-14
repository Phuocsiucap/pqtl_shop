package org.example.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Entity quản lý bàn giao ca làm việc
 * Lưu trữ thông tin về ca làm việc, tiền mặt đầu ca/cuối ca,
 * doanh thu và các đơn hàng trong ca
 */
@Data
@Document(collection = "shift_handovers")
public class ShiftHandover {
    @Id
    private String id;
    
    // Thông tin nhân viên
    private String employeeId;                // ID nhân viên
    private String employeeName;              // Tên nhân viên
    
    // Thông tin ca làm việc
    private String shiftName;                 // Tên ca: "Ca sáng", "Ca chiều", "Ca tối"
    private LocalDateTime shiftStartTime;     // Thời gian bắt đầu ca
    private LocalDateTime shiftEndTime;       // Thời gian kết thúc ca
    
    // Tiền mặt đầu ca (tiền lẻ để thối)
    private double openingCash;               // Tiền mặt đầu ca
    
    // Tổng kết doanh thu trong ca
    private double totalRevenue;              // Tổng doanh thu từ POS/hệ thống
    private double cashRevenue;               // Doanh thu tiền mặt
    private double bankTransferRevenue;       // Doanh thu chuyển khoản
    private double eWalletRevenue;            // Doanh thu ví điện tử
    
    // Đếm tiền thực tế cuối ca
    private double actualCashInDrawer;        // Tiền mặt thực tế đếm được trong két
    private double expectedCash;              // Tiền mặt dự kiến = openingCash + cashRevenue
    private double cashDifference;            // Chênh lệch = actualCashInDrawer - expectedCash
    
    // Danh sách các mệnh giá tiền đếm được
    private List<CashDenomination> cashDenominations;
    
    // Thống kê đơn hàng trong ca
    private int totalOrders;                  // Tổng số đơn hàng
    private int cashOrders;                   // Số đơn thanh toán tiền mặt
    private int bankTransferOrders;           // Số đơn chuyển khoản
    private int eWalletOrders;                // Số đơn ví điện tử
    private int cancelledOrders;              // Số đơn bị hủy
    private int returnOrders;                 // Số đơn trả hàng
    
    // Danh sách ID các đơn hàng trong ca
    private List<String> orderIds;
    
    // Ghi chú
    private String notes;                     // Ghi chú của nhân viên
    private String adminNotes;                // Ghi chú của admin
    
    // Trạng thái
    private String status;                    // "OPEN", "PENDING", "APPROVED", "REJECTED"
    
    // Thông tin xác nhận
    private String approvedBy;                // ID admin xác nhận
    private String approvedByName;            // Tên admin xác nhận
    private LocalDateTime approvedAt;         // Thời gian xác nhận
    
    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    /**
     * Inner class để lưu các mệnh giá tiền
     */
    @Data
    public static class CashDenomination {
        private int denomination;             // Mệnh giá: 500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000, 500
        private int quantity;                 // Số lượng
        private double total;                 // Tổng = denomination * quantity
    }
    
    /**
     * Tính tiền mặt dự kiến
     */
    public void calculateExpectedCash() {
        this.expectedCash = this.openingCash + this.cashRevenue;
        this.cashDifference = this.actualCashInDrawer - this.expectedCash;
    }
    
    /**
     * Tính tổng tiền từ các mệnh giá
     */
    public double calculateTotalFromDenominations() {
        if (cashDenominations == null || cashDenominations.isEmpty()) {
            return 0;
        }
        return cashDenominations.stream()
                .mapToDouble(CashDenomination::getTotal)
                .sum();
    }
}
