package org.example.service;

import org.example.dto.RevenueReportDTO;
import org.example.model.Order;
import org.example.model.POSOrder;
import org.example.repository.POSOrderRepository;
import org.example.repository.order.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private POSOrderRepository posOrderRepository;

    public RevenueReportDTO getRevenueReport(LocalDateTime startDate, LocalDateTime endDate) {
        RevenueReportDTO report = new RevenueReportDTO();

        // Init maps
        Map<String, Double> revenueByPaymentMethod = new HashMap<>();
        Map<String, Double> revenueByDate = new HashMap<>(); // Format YYYY-MM-DD

        // 1. Process Online Orders
        List<Order> onlineOrders = orderRepository.findByCompletedAtBetween(startDate, endDate);

        double onlineRevenue = 0;
        double onlineProfit = 0;
        long onlineCount = 0;

        for (Order order : onlineOrders) {
            // Chỉ tính đơn đã giao (dù query đã lọc, check lại cho chắc)
            if (order.getCompletedAt() != null) {
                double amount = order.getFinalAmount();
                double profit = order.getTotalProfit();

                onlineRevenue += amount;
                onlineProfit += profit;
                onlineCount++;

                // Payment Method
                String paymentMethod = order.getPaymentMethod() != null ? order.getPaymentMethod() : "UNKNOWN";
                revenueByPaymentMethod.put(paymentMethod,
                    revenueByPaymentMethod.getOrDefault(paymentMethod, 0.0) + amount);

                // Date breakdown
                String dateKey = order.getCompletedAt().toLocalDate().toString();
                revenueByDate.put(dateKey, revenueByDate.getOrDefault(dateKey, 0.0) + amount);
            }
        }

        // 2. Process POS Orders
        List<POSOrder> posOrders = posOrderRepository.findByCompletedAtBetween(startDate, endDate);

        double posRevenue = 0;
        double posProfit = 0;
        long posCount = 0;

        for (POSOrder order : posOrders) {
            if (order.getCompletedAt() != null && "COMPLETED".equals(order.getStatus())) {
                double amount = order.getTotalAmount();
                double profit = order.getTotalProfit();

                posRevenue += amount;
                posProfit += profit;
                posCount++;

                // Payment Method
                String paymentMethod = order.getPaymentMethod() != null ? order.getPaymentMethod() : "UNKNOWN";
                revenueByPaymentMethod.put(paymentMethod,
                    revenueByPaymentMethod.getOrDefault(paymentMethod, 0.0) + amount);

                // Date breakdown
                String dateKey = order.getCompletedAt().toLocalDate().toString();
                revenueByDate.put(dateKey, revenueByDate.getOrDefault(dateKey, 0.0) + amount);
            }
        }

        // 3. Aggregate
        report.setTotalRevenue(onlineRevenue + posRevenue);
        report.setTotalGrossProfit(onlineProfit + posProfit);
        report.setTotalOrders(onlineCount + posCount);

        report.setOnlineRevenue(onlineRevenue);
        report.setOnlineProfit(onlineProfit);
        report.setOnlineOrders(onlineCount);

        report.setPosRevenue(posRevenue);
        report.setPosProfit(posProfit);
        report.setPosOrders(posCount);

        report.setRevenueByPaymentMethod(revenueByPaymentMethod);
        report.setRevenueByDate(revenueByDate);

        return report;
    }
}
