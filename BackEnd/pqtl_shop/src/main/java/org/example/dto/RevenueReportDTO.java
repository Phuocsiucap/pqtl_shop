package org.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevenueReportDTO {
    // Tổng hợp
    private double totalRevenue;
    private double totalGrossProfit; // Lợi nhuận gộp (Doanh thu - Giá vốn)
    private long totalOrders;

    // Breakdown theo kênh
    private double onlineRevenue;
    private double onlineProfit;
    private long onlineOrders;

    private double posRevenue;
    private double posProfit;
    private long posOrders;

    // Breakdown theo phương thức thanh toán
    private Map<String, Double> revenueByPaymentMethod;

    // Nếu cần chi tiết hơn (ví dụ list doanh thu theo ngày để vẽ biểu đồ)
    private Map<String, Double> revenueByDate;
}
