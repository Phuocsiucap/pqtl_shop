package org.example.service;

import org.example.model.POSOrder;
import org.example.model.Product;
import org.example.model.ShiftHandover;
import org.example.repository.POSOrderRepository;
import org.example.repository.ProductRepository;
import org.example.repository.ShiftHandoverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ShiftHandoverService {
    
    @Autowired
    private ShiftHandoverRepository shiftHandoverRepository;
    
    @Autowired
    private POSOrderRepository posOrderRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    // ==================== SHIFT HANDOVER MANAGEMENT ====================
    
    /**
     * Mở ca mới cho nhân viên
     */
    public ShiftHandover openShift(Map<String, Object> shiftData) throws Exception {
        String employeeId = (String) shiftData.get("employeeId");
        
        // Kiểm tra xem nhân viên có đang mở ca nào không
        Optional<ShiftHandover> existingShift = shiftHandoverRepository
                .findByEmployeeIdAndStatus(employeeId, "OPEN");
        
        if (existingShift.isPresent()) {
            throw new Exception("Nhân viên đang có ca làm việc chưa đóng. Vui lòng đóng ca trước khi mở ca mới.");
        }
        
        ShiftHandover shift = new ShiftHandover();
        shift.setEmployeeId(employeeId);
        shift.setEmployeeName((String) shiftData.get("employeeName"));
        shift.setShiftName((String) shiftData.get("shiftName"));
        shift.setShiftStartTime(LocalDateTime.now());
        
        // Tiền mặt đầu ca
        if (shiftData.get("openingCash") != null) {
            shift.setOpeningCash(Double.parseDouble(shiftData.get("openingCash").toString()));
        }
        
        // Khởi tạo các giá trị mặc định
        shift.setTotalRevenue(0);
        shift.setCashRevenue(0);
        shift.setBankTransferRevenue(0);
        shift.setEWalletRevenue(0);
        shift.setActualCashInDrawer(0);
        shift.setExpectedCash(shift.getOpeningCash());
        shift.setCashDifference(0);
        shift.setTotalOrders(0);
        shift.setCashOrders(0);
        shift.setBankTransferOrders(0);
        shift.setEWalletOrders(0);
        shift.setCancelledOrders(0);
        shift.setReturnOrders(0);
        shift.setOrderIds(new ArrayList<>());
        shift.setStatus("OPEN");
        shift.setCreatedAt(LocalDateTime.now());
        shift.setUpdatedAt(LocalDateTime.now());
        
        if (shiftData.get("notes") != null) {
            shift.setNotes((String) shiftData.get("notes"));
        }
        
        return shiftHandoverRepository.save(shift);
    }
    
    /**
     * Đóng ca và gửi bàn giao
     */
    @SuppressWarnings("unchecked")
    public ShiftHandover closeShift(String shiftId, Map<String, Object> closeData) throws Exception {
        Optional<ShiftHandover> shiftOpt = shiftHandoverRepository.findById(shiftId);
        
        if (shiftOpt.isEmpty()) {
            throw new Exception("Không tìm thấy ca làm việc");
        }
        
        ShiftHandover shift = shiftOpt.get();
        
        if (!shift.getStatus().equals("OPEN")) {
            throw new Exception("Ca làm việc không ở trạng thái mở");
        }
        
        // Cập nhật thời gian kết thúc ca
        shift.setShiftEndTime(LocalDateTime.now());
        
        // Cập nhật tiền mặt thực tế đếm được
        if (closeData.get("actualCashInDrawer") != null) {
            shift.setActualCashInDrawer(Double.parseDouble(closeData.get("actualCashInDrawer").toString()));
        }
        
        // Cập nhật danh sách mệnh giá tiền
        if (closeData.get("cashDenominations") != null) {
            List<Map<String, Object>> denomData = (List<Map<String, Object>>) closeData.get("cashDenominations");
            List<ShiftHandover.CashDenomination> denominations = new ArrayList<>();
            
            for (Map<String, Object> d : denomData) {
                ShiftHandover.CashDenomination denom = new ShiftHandover.CashDenomination();
                denom.setDenomination(Integer.parseInt(d.get("denomination").toString()));
                denom.setQuantity(Integer.parseInt(d.get("quantity").toString()));
                denom.setTotal(Double.parseDouble(d.get("total").toString()));
                denominations.add(denom);
            }
            
            shift.setCashDenominations(denominations);
        }
        
        // Tính toán doanh thu từ các đơn hàng POS trong ca
        calculateShiftRevenue(shift);
        
        // Tính tiền mặt dự kiến và chênh lệch
        shift.calculateExpectedCash();
        
        // Cập nhật ghi chú
        if (closeData.get("notes") != null) {
            shift.setNotes((String) closeData.get("notes"));
        }
        
        // Chuyển trạng thái sang chờ xác nhận
        shift.setStatus("PENDING");
        shift.setUpdatedAt(LocalDateTime.now());
        
        return shiftHandoverRepository.save(shift);
    }
    
    /**
     * Tính toán doanh thu từ các đơn POS trong ca
     */
    private void calculateShiftRevenue(ShiftHandover shift) {
        List<POSOrder> orders = posOrderRepository.findByShiftHandoverIdOrderByOrderTimeDesc(shift.getId());
        
        double totalRevenue = 0;
        double cashRevenue = 0;
        double bankTransferRevenue = 0;
        double eWalletRevenue = 0;
        int cashOrders = 0;
        int bankTransferOrders = 0;
        int eWalletOrders = 0;
        int cancelledOrders = 0;
        List<String> orderIds = new ArrayList<>();
        
        for (POSOrder order : orders) {
            if ("CANCELLED".equals(order.getStatus())) {
                cancelledOrders++;
                continue;
            }
            
            if ("COMPLETED".equals(order.getStatus())) {
                totalRevenue += order.getTotalAmount();
                orderIds.add(order.getId());
                
                switch (order.getPaymentMethod()) {
                    case "CASH":
                        cashRevenue += order.getTotalAmount();
                        cashOrders++;
                        break;
                    case "BANK_TRANSFER":
                        bankTransferRevenue += order.getTotalAmount();
                        bankTransferOrders++;
                        break;
                    case "EWALLET":
                        eWalletRevenue += order.getTotalAmount();
                        eWalletOrders++;
                        break;
                }
            }
        }
        
        shift.setTotalRevenue(totalRevenue);
        shift.setCashRevenue(cashRevenue);
        shift.setBankTransferRevenue(bankTransferRevenue);
        shift.setEWalletRevenue(eWalletRevenue);
        shift.setTotalOrders(cashOrders + bankTransferOrders + eWalletOrders);
        shift.setCashOrders(cashOrders);
        shift.setBankTransferOrders(bankTransferOrders);
        shift.setEWalletOrders(eWalletOrders);
        shift.setCancelledOrders(cancelledOrders);
        shift.setOrderIds(orderIds);
    }
    
    /**
     * Admin phê duyệt bàn giao ca
     */
    public ShiftHandover approveShift(String shiftId, String adminId, String adminName, String adminNotes) throws Exception {
        Optional<ShiftHandover> shiftOpt = shiftHandoverRepository.findById(shiftId);
        
        if (shiftOpt.isEmpty()) {
            throw new Exception("Không tìm thấy ca làm việc");
        }
        
        ShiftHandover shift = shiftOpt.get();
        
        if (!shift.getStatus().equals("PENDING")) {
            throw new Exception("Ca làm việc không ở trạng thái chờ xác nhận");
        }
        
        shift.setStatus("APPROVED");
        shift.setApprovedBy(adminId);
        shift.setApprovedByName(adminName);
        shift.setApprovedAt(LocalDateTime.now());
        
        if (adminNotes != null && !adminNotes.isEmpty()) {
            shift.setAdminNotes(adminNotes);
        }
        
        shift.setUpdatedAt(LocalDateTime.now());
        
        return shiftHandoverRepository.save(shift);
    }
    
    /**
     * Admin từ chối bàn giao ca
     */
    public ShiftHandover rejectShift(String shiftId, String adminId, String adminName, String adminNotes) throws Exception {
        Optional<ShiftHandover> shiftOpt = shiftHandoverRepository.findById(shiftId);
        
        if (shiftOpt.isEmpty()) {
            throw new Exception("Không tìm thấy ca làm việc");
        }
        
        ShiftHandover shift = shiftOpt.get();
        
        if (!shift.getStatus().equals("PENDING")) {
            throw new Exception("Ca làm việc không ở trạng thái chờ xác nhận");
        }
        
        shift.setStatus("REJECTED");
        shift.setApprovedBy(adminId);
        shift.setApprovedByName(adminName);
        shift.setApprovedAt(LocalDateTime.now());
        
        if (adminNotes != null && !adminNotes.isEmpty()) {
            shift.setAdminNotes(adminNotes);
        }
        
        shift.setUpdatedAt(LocalDateTime.now());
        
        return shiftHandoverRepository.save(shift);
    }
    
    /**
     * Lấy ca đang mở của nhân viên
     */
    public ShiftHandover getCurrentShift(String employeeId) throws Exception {
        Optional<ShiftHandover> shiftOpt = shiftHandoverRepository.findByEmployeeIdAndStatus(employeeId, "OPEN");
        
        if (shiftOpt.isEmpty()) {
            throw new Exception("Nhân viên không có ca làm việc đang mở");
        }
        
        return shiftOpt.get();
    }
    
    /**
     * Lấy danh sách tất cả ca làm việc
     */
    public List<ShiftHandover> getAllShifts() {
        return shiftHandoverRepository.findAllByOrderByCreatedAtDesc();
    }
    
    /**
     * Lấy danh sách ca theo trạng thái
     */
    public List<ShiftHandover> getShiftsByStatus(String status) {
        return shiftHandoverRepository.findByStatusOrderByCreatedAtDesc(status);
    }
    
    /**
     * Lấy lịch sử bàn giao ca của nhân viên
     */
    public List<ShiftHandover> getEmployeeShiftHistory(String employeeId) {
        return shiftHandoverRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
    }
    
    /**
     * Lấy chi tiết một ca làm việc
     */
    public ShiftHandover getShiftById(String shiftId) throws Exception {
        return shiftHandoverRepository.findById(shiftId)
                .orElseThrow(() -> new Exception("Không tìm thấy ca làm việc"));
    }
    
    /**
     * Đếm số ca đang chờ xác nhận
     */
    public long countPendingShifts() {
        return shiftHandoverRepository.countByStatus("PENDING");
    }
    
    /**
     * Thống kê tổng quan bàn giao ca
     */
    public Map<String, Object> getShiftStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        List<ShiftHandover> shifts = shiftHandoverRepository.findByShiftStartTimeBetween(startDate, endDate);
        
        Map<String, Object> stats = new HashMap<>();
        
        long totalShifts = shifts.size();
        long approvedShifts = shifts.stream().filter(s -> "APPROVED".equals(s.getStatus())).count();
        long pendingShifts = shifts.stream().filter(s -> "PENDING".equals(s.getStatus())).count();
        long rejectedShifts = shifts.stream().filter(s -> "REJECTED".equals(s.getStatus())).count();
        
        double totalRevenue = shifts.stream()
                .filter(s -> "APPROVED".equals(s.getStatus()))
                .mapToDouble(ShiftHandover::getTotalRevenue)
                .sum();
        
        double totalCashDifference = shifts.stream()
                .filter(s -> "APPROVED".equals(s.getStatus()))
                .mapToDouble(ShiftHandover::getCashDifference)
                .sum();
        
        stats.put("totalShifts", totalShifts);
        stats.put("approvedShifts", approvedShifts);
        stats.put("pendingShifts", pendingShifts);
        stats.put("rejectedShifts", rejectedShifts);
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalCashDifference", totalCashDifference);
        
        return stats;
    }
    
    // ==================== POS ORDER MANAGEMENT ====================
    
    /**
     * Tạo đơn hàng POS mới
     */
    @SuppressWarnings("unchecked")
    public POSOrder createPOSOrder(Map<String, Object> orderData) throws Exception {
        String employeeId = (String) orderData.get("employeeId");
        
        // Kiểm tra nhân viên có ca đang mở không
        Optional<ShiftHandover> currentShift = shiftHandoverRepository.findByEmployeeIdAndStatus(employeeId, "OPEN");
        
        if (currentShift.isEmpty()) {
            throw new Exception("Nhân viên chưa mở ca làm việc. Vui lòng mở ca trước khi bán hàng.");
        }
        
        POSOrder order = new POSOrder();
        
        // Generate mã đơn POS
        order.setPosOrderCode(generatePOSOrderCode());
        
        // Thông tin nhân viên
        order.setEmployeeId(employeeId);
        order.setEmployeeName((String) orderData.get("employeeName"));
        order.setShiftHandoverId(currentShift.get().getId());
        
        // Thông tin khách hàng
        order.setCustomerId((String) orderData.get("customerId"));
        order.setCustomerName((String) orderData.get("customerName"));
        order.setCustomerPhone((String) orderData.get("customerPhone"));
        
        // Xử lý danh sách sản phẩm
        List<Map<String, Object>> itemsData = (List<Map<String, Object>>) orderData.get("items");
        List<POSOrder.POSOrderItem> items = new ArrayList<>();
        double subtotal = 0;
        
        for (Map<String, Object> itemData : itemsData) {
            POSOrder.POSOrderItem item = new POSOrder.POSOrderItem();
            String productId = (String) itemData.get("productId");
            
            // Lấy thông tin sản phẩm
            Optional<Product> productOpt = productRepository.findById(productId);
            if (productOpt.isEmpty()) {
                throw new Exception("Sản phẩm không tồn tại: " + productId);
            }
            
            Product product = productOpt.get();
            int quantity = Integer.parseInt(itemData.get("quantity").toString());
            
            // Kiểm tra tồn kho
            if (product.getStockQuantity() < quantity) {
                throw new Exception("Sản phẩm " + product.getName() + " không đủ tồn kho. Còn: " + product.getStockQuantity());
            }
            
            item.setProductId(productId);
            item.setProductName(product.getName());
            item.setProductImage(product.getImage());
            item.setUnitPrice(product.getFinalPrice());
            item.setCostPrice(product.getCostPrice() != null ? product.getCostPrice() : 0);
            item.setQuantity(quantity);
            
            double itemDiscount = 0;
            if (itemData.get("discount") != null) {
                itemDiscount = Double.parseDouble(itemData.get("discount").toString());
            }
            item.setDiscount(itemDiscount);
            
            double itemTotal = (item.getUnitPrice() - itemDiscount) * quantity;
            item.setTotalPrice(itemTotal);
            item.setProfit((item.getUnitPrice() - item.getCostPrice() - itemDiscount) * quantity);
            
            items.add(item);
            subtotal += itemTotal;
            
            // Cập nhật tồn kho
            product.setStockQuantity(product.getStockQuantity() - quantity);
            product.setSoldQuantity(product.getSoldQuantity() + quantity);
            productRepository.save(product);
        }
        
        order.setItems(items);
        order.setSubtotal(subtotal);
        
        // Giảm giá cho đơn hàng
        double orderDiscount = 0;
        if (orderData.get("discount") != null) {
            orderDiscount = Double.parseDouble(orderData.get("discount").toString());
        }
        order.setDiscount(orderDiscount);
        order.setTotalAmount(subtotal - orderDiscount);
        
        // Thông tin thanh toán
        order.setPaymentMethod((String) orderData.get("paymentMethod"));
        
        if (orderData.get("amountReceived") != null) {
            double amountReceived = Double.parseDouble(orderData.get("amountReceived").toString());
            order.setAmountReceived(amountReceived);
            order.setChangeAmount(amountReceived - order.getTotalAmount());
        }
        
        // Trạng thái và ghi chú
        order.setStatus("COMPLETED");
        order.setNotes((String) orderData.get("notes"));
        order.setOrderTime(LocalDateTime.now());
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        
        return posOrderRepository.save(order);
    }
    
    /**
     * Generate mã đơn POS: POS-YYYYMMDD-XXXX
     */
    private String generatePOSOrderCode() {
        String datePattern = "POS-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        List<POSOrder> lastOrders = posOrderRepository.findLastOrderCodeByDatePattern(datePattern);
        
        int nextNumber = 1;
        if (!lastOrders.isEmpty()) {
            String lastCode = lastOrders.get(0).getPosOrderCode();
            String[] parts = lastCode.split("-");
            if (parts.length == 3) {
                nextNumber = Integer.parseInt(parts[2]) + 1;
            }
        }
        
        return datePattern + "-" + String.format("%04d", nextNumber);
    }
    
    /**
     * Hủy đơn POS
     */
    public POSOrder cancelPOSOrder(String orderId, String reason) throws Exception {
        Optional<POSOrder> orderOpt = posOrderRepository.findById(orderId);
        
        if (orderOpt.isEmpty()) {
            throw new Exception("Không tìm thấy đơn hàng");
        }
        
        POSOrder order = orderOpt.get();
        
        if ("CANCELLED".equals(order.getStatus())) {
            throw new Exception("Đơn hàng đã bị hủy trước đó");
        }
        
        // Hoàn lại tồn kho
        for (POSOrder.POSOrderItem item : order.getItems()) {
            Optional<Product> productOpt = productRepository.findById(item.getProductId());
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                product.setSoldQuantity(product.getSoldQuantity() - item.getQuantity());
                productRepository.save(product);
            }
        }
        
        order.setStatus("CANCELLED");
        order.setNotes(order.getNotes() != null ? order.getNotes() + " | Lý do hủy: " + reason : "Lý do hủy: " + reason);
        order.setUpdatedAt(LocalDateTime.now());
        
        return posOrderRepository.save(order);
    }
    
    /**
     * Lấy danh sách đơn POS của một ca
     */
    public List<POSOrder> getPOSOrdersByShift(String shiftId) {
        return posOrderRepository.findByShiftHandoverIdOrderByOrderTimeDesc(shiftId);
    }
    
    /**
     * Lấy danh sách tất cả đơn POS
     */
    public List<POSOrder> getAllPOSOrders() {
        return posOrderRepository.findAllByOrderByOrderTimeDesc();
    }
    
    /**
     * Lấy chi tiết đơn POS
     */
    public POSOrder getPOSOrderById(String orderId) throws Exception {
        return posOrderRepository.findById(orderId)
                .orElseThrow(() -> new Exception("Không tìm thấy đơn hàng"));
    }
    
    /**
     * Tìm kiếm sản phẩm cho POS
     */
    public List<Product> searchProductsForPOS(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return productRepository.findAll().stream()
                    .filter(p -> p.getStockQuantity() > 0)
                    .limit(20)
                    .collect(Collectors.toList());
        }
        
        return productRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() > 0)
                .filter(p -> 
                    (p.getName() != null && p.getName().toLowerCase().contains(keyword.toLowerCase())) ||
                    (p.getCategory() != null && p.getCategory().toLowerCase().contains(keyword.toLowerCase())) ||
                    (p.getBrand() != null && p.getBrand().toLowerCase().contains(keyword.toLowerCase()))
                )
                .limit(20)
                .collect(Collectors.toList());
    }
}
