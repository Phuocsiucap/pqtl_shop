package org.example.controller;

import org.example.model.Order;
import org.example.model.OrderItem;
import org.example.model.POSOrder;
import org.example.model.Product;
import org.example.repository.POSOrderRepository;
import org.example.repository.ProductRepository;
import org.example.repository.order.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/migration")
public class MigrationController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private POSOrderRepository posOrderRepository;

    @Autowired
    private ProductRepository productRepository;

    @PostMapping("/backfill-v1")
    public ResponseEntity<?> backfillData() {
        Map<String, Object> result = new HashMap<>();
        long updatedOnlineOrders = 0;
        long updatedPosOrders = 0;

        // 1. Backfill Online Orders
        List<Order> onlineOrders = orderRepository.findAll();
        for (Order order : onlineOrders) {
            boolean changed = false;

            // Set Channel
            if (order.getChannel() == null) {
                order.setChannel("ONLINE");
                changed = true;
            }

            // Set CompletedAt
            if (order.getCompletedAt() == null && "Đã giao".equals(order.getOrderStatus())) {
                order.setCompletedAt(order.getUpdatedAt() != null ? order.getUpdatedAt() : order.getOrderDate());
                changed = true;
            }

            // Backfill Cost & Profit
            if (order.getItems() != null) {
                double newTotalProfit = 0;
                boolean profitChanged = false;

                for (OrderItem item : order.getItems()) {
                    // Nếu chưa có costPrice hoặc bằng 0, lấy từ Product hiện tại
                    if (item.getCostPrice() <= 0) {
                        Optional<Product> p = productRepository.findById(item.getProductId());
                        if (p.isPresent()) {
                            double currentCost = p.get().getCostPrice() != null ? p.get().getCostPrice() : 0;
                            item.setCostPrice(currentCost);
                            changed = true;
                            profitChanged = true;
                        }
                    }

                    // Tính lại Profit cho item (nếu chưa đúng)
                    // Profit = (Giá bán - Giảm giá - Giá vốn) * SL
                    double expectedProfit = (item.getPrice() - item.getDiscount() - item.getCostPrice()) * item.getQuantity();
                    newTotalProfit += expectedProfit;
                }

                // Cập nhật lại totalProfit nếu có thay đổi hoặc nếu totalProfit đang bằng 0
                if (profitChanged || (order.getTotalProfit() == 0 && newTotalProfit != 0)) {
                    order.setTotalProfit(newTotalProfit);
                    changed = true;
                }
            }

            if (changed) {
                orderRepository.save(order);
                updatedOnlineOrders++;
            }
        }

        // 2. Backfill POS Orders
        List<POSOrder> posOrders = posOrderRepository.findAll();
        for (POSOrder order : posOrders) {
            boolean changed = false;

            // Set Channel
            if (order.getChannel() == null) {
                order.setChannel("POS");
                changed = true;
            }

            // Set CompletedAt
            if (order.getCompletedAt() == null && "COMPLETED".equals(order.getStatus())) {
                order.setCompletedAt(order.getOrderTime());
                changed = true;
            }

            if (changed) {
                posOrderRepository.save(order);
                updatedPosOrders++;
            }
        }

        result.put("status", "SUCCESS");
        result.put("updatedOnlineOrders", updatedOnlineOrders);
        result.put("updatedPosOrders", updatedPosOrders);

        return ResponseEntity.ok(result);
    }
}
