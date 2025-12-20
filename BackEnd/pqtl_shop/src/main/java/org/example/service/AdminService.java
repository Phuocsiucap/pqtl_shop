package org.example.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.example.model.Order;
import org.example.model.Product;
import org.example.model.login.User;
import org.example.repository.ProductRepository;
import org.example.repository.login.UserRepository;
import org.example.repository.order.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    // ==================== USER MANAGEMENT ====================
    /**
     * Lấy tất cả người dùng
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Xóa người dùng
     */
    public void deleteUser(String userId) throws Exception {
        if (!userRepository.existsById(userId)) {
            throw new Exception("Người dùng không tồn tại");
        }
        userRepository.deleteById(userId);
    }

    // ==================== PRODUCT MANAGEMENT ====================
    /**
     * Lấy tất cả sản phẩm, sắp xếp theo thời gian tạo gần nhất
     */
    public List<Product> getAllProducts() {
        List<Product> products = productRepository.findAll();
        // Sắp xếp theo createdAt giảm dần (mới nhất trước)
        products.sort((p1, p2) -> {
            if (p1.getCreatedAt() == null && p2.getCreatedAt() == null) return 0;
            if (p1.getCreatedAt() == null) return 1;
            if (p2.getCreatedAt() == null) return -1;
            return p2.getCreatedAt().compareTo(p1.getCreatedAt());
        });
        return products;
    }

    /**
     * Tạo sản phẩm mới với URL ảnh (đã upload lên Cloudinary trước)
     */
    @SuppressWarnings("unchecked")
    public Product createProduct(Map<String, Object> productData) {
        Product product = new Product();
        
        // Set các trường cơ bản
        product.setName((String) productData.get("name"));
        product.setDescription((String) productData.get("description"));
        product.setCategory((String) productData.get("category"));
        product.setBrand((String) productData.get("brand"));
        product.setOrigin((String) productData.get("origin"));
        product.setSpecifications((String) productData.get("specifications"));
        product.setSubCategory((String) productData.get("subCategory"));
        product.setBatchNumber((String) productData.get("batchNumber"));
        
        // Set URL ảnh (đã upload lên Cloudinary)
        product.setImage((String) productData.get("image"));
        
        // Set ảnh phụ (danh sách URL)
        if (productData.get("additionalImages") != null) {
            product.setAdditionalImages((List<String>) productData.get("additionalImages"));
        }
        
        // Set các trường số
        if (productData.get("price") != null) {
            product.setPrice(Double.parseDouble(productData.get("price").toString()));
        }
        if (productData.get("costPrice") != null) {
            product.setCostPrice(Double.parseDouble(productData.get("costPrice").toString()));
        }
        if (productData.get("discount") != null) {
            product.setDiscount(Double.parseDouble(productData.get("discount").toString()));
        }
        if (productData.get("stockQuantity") != null) {
            product.setStockQuantity(Integer.parseInt(productData.get("stockQuantity").toString()));
        }
        

        // Set finalPrice
        // Sẽ được tính lại ở cuối hàm sau khi có đầy đủ thông tin (bao gồm clearance)

        
        // Set các trường ngày
        if (productData.get("manufacturingDate") != null && !productData.get("manufacturingDate").toString().isEmpty()) {
            product.setManufacturingDate(LocalDate.parse(productData.get("manufacturingDate").toString()));
        }
        if (productData.get("expiryDate") != null && !productData.get("expiryDate").toString().isEmpty()) {
            product.setExpiryDate(LocalDate.parse(productData.get("expiryDate").toString()));
        }
        
        // Set các trường boolean
        if (productData.get("isBestSeller") != null) {
            product.setIsBestSeller(Boolean.parseBoolean(productData.get("isBestSeller").toString()));
        }
        if (productData.get("isSeasonal") != null) {
            product.setIsSeasonal(Boolean.parseBoolean(productData.get("isSeasonal").toString()));
        }
        if (productData.get("isClearance") != null) {
            product.setIsClearance(Boolean.parseBoolean(productData.get("isClearance").toString()));
        }
        if (productData.get("clearanceDiscount") != null) {
            product.setClearanceDiscount(Double.parseDouble(productData.get("clearanceDiscount").toString()));
        }
        
        // Set các giá trị mặc định
        product.setSoldQuantity(0);
        product.setRating(0.0);
        product.setReviewCount(0);
        product.setCreatedAt(Instant.now());
        
        // Cập nhật trạng thái hết hạn nếu có
        product.updateExpiryStatus();

        // Tính toán lại finalPrice
        calculateAndSetFinalPrice(product);

        return productRepository.save(product);
    }

    /**
     * Cập nhật sản phẩm với URL ảnh (đã upload lên Cloudinary trước)
     */
    @SuppressWarnings("unchecked")
    public Product updateProduct(String id, Map<String, Object> productData) {
        Optional<Product> productOpt = productRepository.findById(id);
        
        if (productOpt.isEmpty()) {
            throw new IllegalArgumentException("Sản phẩm không tồn tại");
        }
        
        Product existingProduct = productOpt.get();
        
        // Cập nhật các trường từ Map
        if (productData.get("name") != null) {
            existingProduct.setName((String) productData.get("name"));
        }
        if (productData.get("description") != null) {
            existingProduct.setDescription((String) productData.get("description"));
        }
        if (productData.get("category") != null) {
            existingProduct.setCategory((String) productData.get("category"));
        }
        if (productData.get("brand") != null) {
            existingProduct.setBrand((String) productData.get("brand"));
        }
        if (productData.get("origin") != null) {
            existingProduct.setOrigin((String) productData.get("origin"));
        }
        if (productData.get("specifications") != null) {
            existingProduct.setSpecifications((String) productData.get("specifications"));
        }
        if (productData.get("subCategory") != null) {
            existingProduct.setSubCategory((String) productData.get("subCategory"));
        }
        if (productData.get("batchNumber") != null) {
            existingProduct.setBatchNumber((String) productData.get("batchNumber"));
        }
        
        // Cập nhật URL ảnh (nếu có ảnh mới đã upload lên Cloudinary)
        if (productData.get("image") != null) {
            existingProduct.setImage((String) productData.get("image"));
        }
        
        // Cập nhật ảnh phụ
        if (productData.get("additionalImages") != null) {
            existingProduct.setAdditionalImages((List<String>) productData.get("additionalImages"));
        }
        
        // Cập nhật các trường số
        if (productData.get("price") != null) {
            existingProduct.setPrice(Double.parseDouble(productData.get("price").toString()));
        }
        if (productData.get("costPrice") != null) {
            existingProduct.setCostPrice(Double.parseDouble(productData.get("costPrice").toString()));
        }
        if (productData.get("discount") != null) {
            existingProduct.setDiscount(Double.parseDouble(productData.get("discount").toString()));
        }
        if (productData.get("stockQuantity") != null) {
            existingProduct.setStockQuantity(Integer.parseInt(productData.get("stockQuantity").toString()));
        }
        
        // Cập nhật finalPrice
        // Sẽ được tính lại ở cuối hàm sau khi có đầy đủ thông tin

        
        // Cập nhật các trường ngày
        if (productData.get("manufacturingDate") != null && !productData.get("manufacturingDate").toString().isEmpty()) {
            existingProduct.setManufacturingDate(LocalDate.parse(productData.get("manufacturingDate").toString()));
        }
        if (productData.get("expiryDate") != null && !productData.get("expiryDate").toString().isEmpty()) {
            existingProduct.setExpiryDate(LocalDate.parse(productData.get("expiryDate").toString()));
        }
        
        // Cập nhật các trường boolean
        if (productData.get("isBestSeller") != null) {
            existingProduct.setIsBestSeller(Boolean.parseBoolean(productData.get("isBestSeller").toString()));
        }
        if (productData.get("isSeasonal") != null) {
            existingProduct.setIsSeasonal(Boolean.parseBoolean(productData.get("isSeasonal").toString()));
        }
        if (productData.get("isClearance") != null) {
            existingProduct.setIsClearance(Boolean.parseBoolean(productData.get("isClearance").toString()));
        }
        if (productData.get("clearanceDiscount") != null) {
            existingProduct.setClearanceDiscount(Double.parseDouble(productData.get("clearanceDiscount").toString()));
        }
        
        // Cập nhật trạng thái hết hạn
        existingProduct.updateExpiryStatus();

        // Tính toán lại finalPrice
        calculateAndSetFinalPrice(existingProduct);

        return productRepository.save(existingProduct);
    }

    /**
     * Xóa sản phẩm
     */
    public void deleteProduct(String productId) throws Exception {
        if (!productRepository.existsById(productId)) {
            throw new Exception("Sản phẩm không tồn tại");
        }
        productRepository.deleteById(productId);
    }

    // ==================== ORDER MANAGEMENT ====================
    /**
     * Lấy tất cả đơn hàng
     */
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    /**
     * Lấy chi tiết đơn hàng theo ID
     */
    public Order getOrderDetails(String orderId) throws Exception {
        Optional<Order> order = orderRepository.findById(orderId);
        
        if (order.isEmpty()) {
            throw new Exception("Đơn hàng không tồn tại");
        }
        
        return order.get();
    }

    /**
     * Cập nhật trạng thái giao hàng
     */
    public Order updateOrderStatus(String orderId, String shippingStatus) throws Exception {
        if (orderId == null || orderId.equals("null") || orderId.trim().isEmpty()) {
            throw new Exception("ID đơn hàng không hợp lệ");
        }
        
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        
        if (orderOpt.isEmpty()) {
            throw new Exception("Đơn hàng không tồn tại");
        }
        
        Order order = orderOpt.get();
        order.setShipping_status(shippingStatus);
        // Đồng bộ orderStatus với shipping_status để khách hàng cũng thấy trạng thái mới
        order.setOrderStatus(shippingStatus);
        order.setUpdatedAt(LocalDateTime.now());
        
        return orderRepository.save(order);
    }

    // ==================== STATISTICS ====================
    /**
     * Lấy doanh thu hôm nay
     */
    public Map<String, Object> getTodayRevenue() {
        LocalDate today = LocalDate.now();
        List<Order> allOrders = orderRepository.findAll();
        
        // Lọc đơn hàng hôm nay
        List<Order> todayOrders = allOrders.stream()
                .filter(order -> order.getOrderDate() != null && 
                        order.getOrderDate().toLocalDate().equals(today))
                .collect(Collectors.toList());
        
        double totalRevenue = todayOrders.stream()
                .mapToDouble(Order::getFinalAmount)
                .sum();
        
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long totalOrders = todayOrders.size();
        
        Map<String, Object> result = new HashMap<>();
        result.put("total_revenue", totalRevenue);
        result.put("total_users", totalUsers);
        result.put("total_products", totalProducts);
        result.put("total_orders_today", totalOrders);
        
        return result;
    }

    /**
     * Lấy doanh thu theo tháng
     */
    public List<Map<String, Object>> getMonthlyRevenue() {
        List<Order> allOrders = orderRepository.findAll();
        
        // Nhóm theo tháng
        Map<YearMonth, Double> monthlyRevenue = new HashMap<>();
        
        for (Order order : allOrders) {
            if (order.getOrderDate() != null) {
                YearMonth month = YearMonth.from(order.getOrderDate());
                monthlyRevenue.put(month, monthlyRevenue.getOrDefault(month, 0.0) + order.getFinalAmount());
            }
        }
        
        // Tạo danh sách từ 12 tháng gần đây
        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            YearMonth month = YearMonth.now().minusMonths(i);
            double revenue = monthlyRevenue.getOrDefault(month, 0.0);
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", month.getMonthValue());
            monthData.put("year", month.getYear());
            monthData.put("revenue", revenue);
            
            result.add(monthData);
        }
        
        return result;
    }

    /**
     * Lấy doanh thu theo tuần
     */
    public List<Map<String, Object>> getWeeklyRevenue() {
        List<Order> allOrders = orderRepository.findAll();
        
        // Nhóm theo tuần
        Map<Long, Double> weeklyRevenue = new HashMap<>();
        
        for (Order order : allOrders) {
            if (order.getOrderDate() != null) {
                long weekNumber = ChronoUnit.WEEKS.between(
                        LocalDate.of(2024, 1, 1),
                        order.getOrderDate().toLocalDate()
                );
                weeklyRevenue.put(weekNumber, weeklyRevenue.getOrDefault(weekNumber, 0.0) + order.getFinalAmount());
            }
        }
        
        // Tạo danh sách 52 tuần gần đây
        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 51; i >= 0; i--) {
            long weekNumber = ChronoUnit.WEEKS.between(
                    LocalDate.of(2024, 1, 1),
                    LocalDate.now()
            ) - i;
            double revenue = weeklyRevenue.getOrDefault(weekNumber, 0.0);
            
            Map<String, Object> weekData = new HashMap<>();
            weekData.put("week", weekNumber);
            weekData.put("revenue", revenue);
            
            result.add(weekData);
        }
        
        return result;
    }

    // ==================== BEST SELLER ====================
    /**
     * Lấy danh sách sản phẩm bán chạy với thống kê
     */
    public List<Map<String, Object>> getBestSellerProducts(int limit, String period, LocalDateTime startDate, LocalDateTime endDate) {
        List<Order> allOrders = orderRepository.findAll();
        
        // Xác định khoảng thời gian
        LocalDateTime filterStart;
        LocalDateTime filterEnd = LocalDateTime.now();
        
        if (startDate != null && endDate != null) {
            filterStart = startDate;
            filterEnd = endDate;
        } else {
            switch (period != null ? period : "month") {
                case "week":
                    filterStart = LocalDateTime.now().minusWeeks(1);
                    break;
                case "year":
                    filterStart = LocalDateTime.now().minusYears(1);
                    break;
                case "month":
                default:
                    filterStart = LocalDateTime.now().minusMonths(1);
                    break;
            }
        }
        
        final LocalDateTime finalStart = filterStart;
        final LocalDateTime finalEnd = filterEnd;
        
        // Lọc đơn hàng trong khoảng thời gian và đã giao
        List<Order> filteredOrders = allOrders.stream()
                .filter(order -> order.getOrderDate() != null 
                        && order.getOrderDate().isAfter(finalStart) 
                        && order.getOrderDate().isBefore(finalEnd)
                        && "Đã giao".equals(order.getShipping_status()))
                .collect(Collectors.toList());
        
        // Thống kê theo sản phẩm
        Map<String, Map<String, Object>> productStats = new HashMap<>();
        
        for (Order order : filteredOrders) {
            if (order.getItems() != null) {
                for (var item : order.getItems()) {
                    String productId = item.getProductId();
                    Map<String, Object> stats = productStats.getOrDefault(productId, new HashMap<>());
                    
                    int currentQty = (int) stats.getOrDefault("soldQuantity", 0);
                    double currentRevenue = (double) stats.getOrDefault("revenue", 0.0);
                    double currentProfit = (double) stats.getOrDefault("profit", 0.0);
                    int currentOrders = (int) stats.getOrDefault("orderCount", 0);
                    
                    // Tính doanh thu và lợi nhuận
                    double itemRevenue = (item.getPrice() - item.getDiscount()) * item.getQuantity();
                    double itemProfit = item.getProfit(); // (giá bán - giảm giá - giá nhập) * số lượng
                    
                    stats.put("productId", productId);
                    stats.put("productName", item.getProductName());
                    stats.put("productImage", item.getImage());
                    stats.put("price", item.getPrice());
                    stats.put("costPrice", item.getCostPrice());
                    stats.put("soldQuantity", currentQty + item.getQuantity());
                    stats.put("revenue", currentRevenue + itemRevenue);
                    stats.put("profit", currentProfit + itemProfit);
                    stats.put("orderCount", currentOrders + 1);
                    
                    productStats.put(productId, stats);
                }
            }
        }
        
        // Sắp xếp theo số lượng bán và lấy top
        return productStats.values().stream()
                .sorted((a, b) -> Integer.compare(
                        (int) b.getOrDefault("soldQuantity", 0),
                        (int) a.getOrDefault("soldQuantity", 0)))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * Lấy thống kê doanh thu của một sản phẩm theo thời gian
     */
    public Map<String, Object> getProductRevenueStats(String productId, String period, LocalDateTime startDate, LocalDateTime endDate) {
        List<Order> allOrders = orderRepository.findAll();
        Optional<Product> productOpt = productRepository.findById(productId);
        
        // Không yêu cầu product phải tồn tại (có thể đã bị xóa nhưng vẫn có trong order history)
        Product product = productOpt.orElse(null);
        
        // Lấy thông tin từ order items nếu product không tồn tại
        String productName = null;
        String productImage = null;
        double productPrice = 0;
        double productCostPrice = 0;
        
        if (product != null) {
            productName = product.getName();
            productImage = product.getImage();
            productPrice = product.getPrice();
            productCostPrice = product.getCostPrice();
        }
        
        // Xác định khoảng thời gian
        LocalDateTime filterStart;
        LocalDateTime filterEnd = LocalDateTime.now();
        
        if (startDate != null && endDate != null) {
            filterStart = startDate;
            filterEnd = endDate;
        } else {
            switch (period != null ? period : "month") {
                case "week":
                    filterStart = LocalDateTime.now().minusWeeks(1);
                    break;
                case "year":
                    filterStart = LocalDateTime.now().minusYears(1);
                    break;
                case "month":
                default:
                    filterStart = LocalDateTime.now().minusMonths(1);
                    break;
            }
        }
        
        final LocalDateTime finalStart = filterStart;
        final LocalDateTime finalEnd = filterEnd;
        
        // Lọc đơn hàng có chứa sản phẩm này
        List<Order> relevantOrders = allOrders.stream()
                .filter(order -> order.getOrderDate() != null 
                        && order.getOrderDate().isAfter(finalStart) 
                        && order.getOrderDate().isBefore(finalEnd)
                        && "Đã giao".equals(order.getShipping_status())
                        && order.getItems() != null
                        && order.getItems().stream().anyMatch(item -> productId.equals(item.getProductId())))
                .collect(Collectors.toList());
        
        // Nếu không có đơn hàng nào thì trả về kết quả rỗng
        if (relevantOrders.isEmpty()) {
            Map<String, Object> emptyResult = new HashMap<>();
            emptyResult.put("productId", productId);
            emptyResult.put("productName", productName);
            emptyResult.put("productImage", productImage);
            emptyResult.put("totalSold", 0);
            emptyResult.put("totalRevenue", 0.0);
            emptyResult.put("totalProfit", 0.0);
            emptyResult.put("orderCount", 0);
            emptyResult.put("avgPrice", productPrice);
            emptyResult.put("costPrice", productCostPrice);
            emptyResult.put("dailyStats", new ArrayList<>());
            emptyResult.put("period", period);
            return emptyResult;
        }
        
        // Thống kê theo ngày
        Map<LocalDate, Map<String, Object>> dailyStats = new TreeMap<>();
        int totalSold = 0;
        double totalRevenue = 0;
        double totalProfit = 0;
        double totalPrice = 0;
        double totalCostPrice = 0;
        int priceCount = 0;
        
        for (Order order : relevantOrders) {
            LocalDate orderDate = order.getOrderDate().toLocalDate();
            
            for (var item : order.getItems()) {
                if (productId.equals(item.getProductId())) {
                    // Lấy thông tin product từ order item nếu chưa có
                    if (productName == null) {
                        productName = item.getProductName();
                    }
                    if (productImage == null) {
                        productImage = item.getImage();
                    }
                    
                    Map<String, Object> dayStats = dailyStats.getOrDefault(orderDate, new HashMap<>());
                    
                    int daySold = (int) dayStats.getOrDefault("sold", 0) + item.getQuantity();
                    double itemRevenue = (item.getPrice() - item.getDiscount()) * item.getQuantity();
                    double itemProfit = item.getProfit();
                    double dayRevenue = (double) dayStats.getOrDefault("revenue", 0.0) + itemRevenue;
                    double dayProfit = (double) dayStats.getOrDefault("profit", 0.0) + itemProfit;
                    
                    dayStats.put("date", orderDate.toString());
                    dayStats.put("sold", daySold);
                    dayStats.put("revenue", dayRevenue);
                    dayStats.put("profit", dayProfit);
                    
                    dailyStats.put(orderDate, dayStats);
                    
                    totalSold += item.getQuantity();
                    totalRevenue += itemRevenue;
                    totalProfit += itemProfit;
                    totalPrice += item.getPrice();
                    totalCostPrice += item.getCostPrice();
                    priceCount++;
                }
            }
        }
        
        double avgPrice = priceCount > 0 ? totalPrice / priceCount : 0;
        double avgCostPrice = priceCount > 0 ? totalCostPrice / priceCount : 0;
        
        // Tạo chartData
        List<String> labels = new ArrayList<>();
        List<Double> revenueValues = new ArrayList<>();
        List<Double> profitValues = new ArrayList<>();
        for (Map.Entry<LocalDate, Map<String, Object>> entry : dailyStats.entrySet()) {
            labels.add(entry.getKey().toString());
            revenueValues.add((Double) entry.getValue().get("revenue"));
            profitValues.add((Double) entry.getValue().get("profit"));
        }
        
        Map<String, Object> chartData = new HashMap<>();
        chartData.put("labels", labels);
        chartData.put("values", revenueValues);
        chartData.put("profitValues", profitValues);
        
        Map<String, Object> result = new HashMap<>();
        result.put("productId", productId);
        result.put("productName", productName);
        result.put("productImage", productImage);
        result.put("totalSold", totalSold);
        result.put("totalRevenue", totalRevenue);
        result.put("totalProfit", totalProfit);
        result.put("orderCount", relevantOrders.size());
        result.put("avgPrice", avgPrice);
        result.put("avgCostPrice", avgCostPrice);
        result.put("dailyStats", new ArrayList<>(dailyStats.values()));
        result.put("chartData", chartData);
        result.put("period", period);
        result.put("startDate", finalStart.toString());
        result.put("endDate", finalEnd.toString());
        
        return result;
    }

    /**
     * Cập nhật user (chỉ admin mới được phép)
     */
    public User updateUser(String userId, Map<String, Object> updates, String adminUserId) throws Exception {
        // Kiểm tra quyền admin
        Optional<User> adminOpt = userRepository.findById(adminUserId);
        if (adminOpt.isEmpty() || !"ADMIN".equals(adminOpt.get().getRole())) {
            throw new Exception("Bạn không có quyền thực hiện thao tác này");
        }
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new Exception("Người dùng không tồn tại");
        }
        
        User user = userOpt.get();
        
        if (updates.containsKey("role")) {
            user.setRole((String) updates.get("role"));
        }
        if (updates.containsKey("isActive")) {
            user.setIsActive((Boolean) updates.get("isActive"));
        }
        if (updates.containsKey("fullName")) {
            user.setFullName((String) updates.get("fullName"));
        }
        if (updates.containsKey("phone")) {
            user.setPhone((String) updates.get("phone"));
        }
        
        return userRepository.save(user);
    }

    /**
     * Lấy thống kê đơn hàng theo trạng thái
     */
    public Map<String, Object> getOrderStatsByStatus() {
        List<Order> allOrders = orderRepository.findAll();
        
        Map<String, Long> statusCounts = allOrders.stream()
                .collect(Collectors.groupingBy(
                        order -> order.getShipping_status() != null ? order.getShipping_status() : "Chờ xác nhận",
                        Collectors.counting()
                ));
        
        Map<String, Object> result = new HashMap<>();
        result.put("total", allOrders.size());
        result.put("choXacNhan", statusCounts.getOrDefault("Chờ xác nhận", 0L));
        result.put("daXacNhan", statusCounts.getOrDefault("Đã xác nhận", 0L));
        result.put("dangGiao", statusCounts.getOrDefault("Đang giao", 0L));
        result.put("daGiao", statusCounts.getOrDefault("Đã giao", 0L));
        result.put("daHuy", statusCounts.getOrDefault("Đã hủy", 0L));
        
        return result;
    }

    /**
     * Lấy báo cáo tài chính (doanh thu, lợi nhuận theo thời gian)
     */
    public Map<String, Object> getFinancialReport(String period, LocalDateTime startDate, LocalDateTime endDate) {
        List<Order> allOrders = orderRepository.findAll();
        
        // Xác định khoảng thời gian
        LocalDateTime filterStart;
        LocalDateTime filterEnd = LocalDateTime.now();
        
        if (startDate != null && endDate != null) {
            filterStart = startDate;
            filterEnd = endDate;
        } else {
            switch (period != null ? period : "month") {
                case "week":
                    filterStart = LocalDateTime.now().minusWeeks(1);
                    break;
                case "year":
                    filterStart = LocalDateTime.now().minusYears(1);
                    break;
                case "month":
                default:
                    filterStart = LocalDateTime.now().minusMonths(1);
                    break;
            }
        }
        
        final LocalDateTime finalStart = filterStart;
        final LocalDateTime finalEnd = filterEnd;
        
        // Lọc đơn hàng đã giao trong khoảng thời gian
        List<Order> completedOrders = allOrders.stream()
                .filter(order -> order.getOrderDate() != null 
                        && order.getOrderDate().isAfter(finalStart) 
                        && order.getOrderDate().isBefore(finalEnd)
                        && "Đã giao".equals(order.getShipping_status()))
                .collect(Collectors.toList());
        
        // Thống kê theo ngày/tháng
        Map<String, Map<String, Object>> periodStats = new TreeMap<>();
        double totalRevenue = 0;
        double totalProfit = 0;
        double totalCost = 0;
        int totalOrders = completedOrders.size();
        int totalItems = 0;
        
        for (Order order : completedOrders) {
            String periodKey;
            if ("year".equals(period)) {
                periodKey = order.getOrderDate().toLocalDate().withDayOfMonth(1).toString(); // Group by month
            } else {
                periodKey = order.getOrderDate().toLocalDate().toString(); // Group by day
            }
            
            Map<String, Object> stats = periodStats.getOrDefault(periodKey, new HashMap<>());
            
            double orderRevenue = order.getFinalAmount();
            double orderProfit = order.getTotalProfit();
            double orderCost = 0;
            int orderItems = 0;
            
            if (order.getItems() != null) {
                for (var item : order.getItems()) {
                    orderCost += item.getCostPrice() * item.getQuantity();
                    orderItems += item.getQuantity();
                }
            }
            
            stats.put("date", periodKey);
            stats.put("revenue", (double) stats.getOrDefault("revenue", 0.0) + orderRevenue);
            stats.put("profit", (double) stats.getOrDefault("profit", 0.0) + orderProfit);
            stats.put("cost", (double) stats.getOrDefault("cost", 0.0) + orderCost);
            stats.put("orders", (int) stats.getOrDefault("orders", 0) + 1);
            stats.put("items", (int) stats.getOrDefault("items", 0) + orderItems);
            
            periodStats.put(periodKey, stats);
            
            totalRevenue += orderRevenue;
            totalProfit += orderProfit;
            totalCost += orderCost;
            totalItems += orderItems;
        }
        
        // Tạo chart data
        List<String> labels = new ArrayList<>();
        List<Double> revenueValues = new ArrayList<>();
        List<Double> profitValues = new ArrayList<>();
        List<Double> costValues = new ArrayList<>();
        
        for (Map.Entry<String, Map<String, Object>> entry : periodStats.entrySet()) {
            labels.add(entry.getKey());
            revenueValues.add((Double) entry.getValue().get("revenue"));
            profitValues.add((Double) entry.getValue().get("profit"));
            costValues.add((Double) entry.getValue().get("cost"));
        }
        
        Map<String, Object> chartData = new HashMap<>();
        chartData.put("labels", labels);
        chartData.put("revenue", revenueValues);
        chartData.put("profit", profitValues);
        chartData.put("cost", costValues);
        
        // Tính tỷ lệ lợi nhuận
        double profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
        
        Map<String, Object> result = new HashMap<>();
        result.put("period", period);
        result.put("startDate", finalStart.toString());
        result.put("endDate", finalEnd.toString());
        result.put("totalRevenue", totalRevenue);
        result.put("totalProfit", totalProfit);
        result.put("totalCost", totalCost);
        result.put("profitMargin", profitMargin);
        result.put("totalOrders", totalOrders);
        result.put("totalItems", totalItems);
        result.put("avgOrderValue", totalOrders > 0 ? totalRevenue / totalOrders : 0);
        result.put("avgProfitPerOrder", totalOrders > 0 ? totalProfit / totalOrders : 0);
        result.put("periodStats", new ArrayList<>(periodStats.values()));
        result.put("chartData", chartData);
        
        return result;
    }

    /**
     * Lấy xếp hạng sản phẩm theo lợi nhuận (cao nhất và thấp nhất)
     */
    public Map<String, Object> getProductsProfitRanking(String period, int limit) {
        List<Order> allOrders = orderRepository.findAll();
        
        // Xác định khoảng thời gian
        LocalDateTime filterStart;
        LocalDateTime filterEnd = LocalDateTime.now();
        
        switch (period != null ? period : "month") {
            case "week":
                filterStart = LocalDateTime.now().minusWeeks(1);
                break;
            case "year":
                filterStart = LocalDateTime.now().minusYears(1);
                break;
            case "month":
            default:
                filterStart = LocalDateTime.now().minusMonths(1);
                break;
        }
        
        final LocalDateTime finalStart = filterStart;
        final LocalDateTime finalEnd = filterEnd;
        
        // Lọc đơn hàng đã giao
        List<Order> completedOrders = allOrders.stream()
                .filter(order -> order.getOrderDate() != null 
                        && order.getOrderDate().isAfter(finalStart) 
                        && order.getOrderDate().isBefore(finalEnd)
                        && "Đã giao".equals(order.getShipping_status()))
                .collect(Collectors.toList());
        
        // Thống kê theo sản phẩm
        Map<String, Map<String, Object>> productStats = new HashMap<>();
        
        for (Order order : completedOrders) {
            if (order.getItems() != null) {
                for (var item : order.getItems()) {
                    String productId = item.getProductId();
                    Map<String, Object> stats = productStats.getOrDefault(productId, new HashMap<>());
                    
                    double itemRevenue = (item.getPrice() - item.getDiscount()) * item.getQuantity();
                    double itemProfit = item.getProfit();
                    double itemCost = item.getCostPrice() * item.getQuantity();
                    
                    stats.put("productId", productId);
                    stats.put("productName", item.getProductName());
                    stats.put("productImage", item.getImage());
                    stats.put("price", item.getPrice());
                    stats.put("costPrice", item.getCostPrice());
                    stats.put("soldQuantity", (int) stats.getOrDefault("soldQuantity", 0) + item.getQuantity());
                    stats.put("revenue", (double) stats.getOrDefault("revenue", 0.0) + itemRevenue);
                    stats.put("profit", (double) stats.getOrDefault("profit", 0.0) + itemProfit);
                    stats.put("cost", (double) stats.getOrDefault("cost", 0.0) + itemCost);
                    stats.put("orderCount", (int) stats.getOrDefault("orderCount", 0) + 1);
                    
                    // Tính biên lợi nhuận
                    double totalRev = (double) stats.get("revenue");
                    double totalProf = (double) stats.get("profit");
                    stats.put("profitMargin", totalRev > 0 ? (totalProf / totalRev) * 100 : 0);
                    
                    productStats.put(productId, stats);
                }
            }
        }
        
        List<Map<String, Object>> allProducts = new ArrayList<>(productStats.values());
        
        // Top lợi nhuận cao nhất
        List<Map<String, Object>> topHighProfit = allProducts.stream()
                .sorted((a, b) -> Double.compare(
                        (double) b.getOrDefault("profit", 0.0),
                        (double) a.getOrDefault("profit", 0.0)))
                .limit(limit)
                .collect(Collectors.toList());
        
        // Top lợi nhuận thấp nhất (hoặc lỗ)
        List<Map<String, Object>> topLowProfit = allProducts.stream()
                .sorted((a, b) -> Double.compare(
                        (double) a.getOrDefault("profit", 0.0),
                        (double) b.getOrDefault("profit", 0.0)))
                .limit(limit)
                .collect(Collectors.toList());
        
        // Top biên lợi nhuận cao nhất
        List<Map<String, Object>> topHighMargin = allProducts.stream()
                .sorted((a, b) -> Double.compare(
                        (double) b.getOrDefault("profitMargin", 0.0),
                        (double) a.getOrDefault("profitMargin", 0.0)))
                .limit(limit)
                .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("period", period);
        result.put("topHighProfit", topHighProfit);
        result.put("topLowProfit", topLowProfit);
        result.put("topHighMargin", topHighMargin);
        result.put("totalProducts", allProducts.size());
        
        return result;
    }

    // ==================== EXPIRY & CLEARANCE MANAGEMENT ====================
    
    /**
     * Cập nhật trạng thái hết hạn cho tất cả sản phẩm
     */
    public void updateAllProductExpiryStatus() {
        List<Product> products = productRepository.findAll();
        for (Product product : products) {
            product.updateExpiryStatus();
            productRepository.save(product);
        }
    }
    
    /**
     * Lấy danh sách sản phẩm đã hết hạn
     */
    public List<Product> getExpiredProducts() {
        updateAllProductExpiryStatus();
        return productRepository.findAll().stream()
                .filter(p -> p.getExpiryDate() != null && p.checkExpired())
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy danh sách sản phẩm sắp hết hạn
     */
    public List<Product> getNearExpiryProducts(int daysThreshold) {
        updateAllProductExpiryStatus();
        return productRepository.findAll().stream()
                .filter(p -> p.getExpiryDate() != null && p.checkNearExpiry(daysThreshold))
                .collect(Collectors.toList());
    }
    
    /**
     * Lấy thống kê sản phẩm theo trạng thái hết hạn
     */
    public Map<String, Object> getExpiryStatistics() {
        updateAllProductExpiryStatus();
        List<Product> allProducts = productRepository.findAll();
        
        long expiredCount = allProducts.stream()
                .filter(p -> p.getExpiryDate() != null && p.checkExpired())
                .count();
        
        long nearExpiry7Days = allProducts.stream()
                .filter(p -> p.getExpiryDate() != null && p.checkNearExpiry(7))
                .count();
        
        long nearExpiry30Days = allProducts.stream()
                .filter(p -> p.getExpiryDate() != null && p.checkNearExpiry(30))
                .count();
        
        long noExpiryDateCount = allProducts.stream()
                .filter(p -> p.getExpiryDate() == null)
                .count();
        
        long validCount = allProducts.stream()
                .filter(p -> p.getExpiryDate() != null && !p.checkExpired() && !p.checkNearExpiry(30))
                .count();
        
        long clearanceCount = allProducts.stream()
                .filter(p -> p.getIsClearance() != null && p.getIsClearance())
                .count();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", allProducts.size());
        stats.put("expired", expiredCount);
        stats.put("nearExpiry7Days", nearExpiry7Days);
        stats.put("nearExpiry30Days", nearExpiry30Days);
        stats.put("noExpiryDate", noExpiryDateCount);
        stats.put("valid", validCount);
        stats.put("clearance", clearanceCount);
        
        return stats;
    }
    
    /**
     * Đánh dấu sản phẩm thanh lý
     */
    public Product markProductAsClearance(String productId, Double clearanceDiscount) throws Exception {
        Optional<Product> productOpt = productRepository.findById(productId);
        
        if (productOpt.isEmpty()) {
            throw new Exception("Sản phẩm không tồn tại");
        }
        
        Product product = productOpt.get();
        product.setIsClearance(true);
        product.setClearanceDiscount(clearanceDiscount != null ? clearanceDiscount : 30.0);

        calculateAndSetFinalPrice(product);

        return productRepository.save(product);
    }
    
    /**
     * Hủy đánh dấu thanh lý sản phẩm
     */
    public Product unmarkProductAsClearance(String productId) throws Exception {
        Optional<Product> productOpt = productRepository.findById(productId);
        
        if (productOpt.isEmpty()) {
            throw new Exception("Sản phẩm không tồn tại");
        }
        
        Product product = productOpt.get();
        product.setIsClearance(false);
        product.setClearanceDiscount(null);

        calculateAndSetFinalPrice(product);

        return productRepository.save(product);
    }
    
    /**
     * Lấy danh sách sản phẩm đang thanh lý
     */
    public List<Product> getClearanceProducts() {
        return productRepository.findAll().stream()
                .filter(p -> p.getIsClearance() != null && p.getIsClearance())
                .collect(Collectors.toList());
    }
    
    /**
     * Tự động đánh dấu thanh lý cho sản phẩm sắp hết hạn
     */
    public Map<String, Object> autoMarkClearanceForNearExpiryProducts(int daysThreshold, Double clearanceDiscount) {
        List<Product> nearExpiryProducts = getNearExpiryProducts(daysThreshold);
        int markedCount = 0;
        
        for (Product product : nearExpiryProducts) {
            if (product.getIsClearance() == null || !product.getIsClearance()) {
                product.setIsClearance(true);
                product.setClearanceDiscount(clearanceDiscount != null ? clearanceDiscount : 30.0);
                calculateAndSetFinalPrice(product);
                productRepository.save(product);
                markedCount++;
            }
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalNearExpiry", nearExpiryProducts.size());
        result.put("markedAsClearance", markedCount);
        
        return result;
    }
    
    /**
     * Xóa sản phẩm đã hết hạn (chuyển sang inactive hoặc xóa)
     */
    public Map<String, Object> removeExpiredProducts(boolean hardDelete) throws Exception {
        List<Product> expiredProducts = getExpiredProducts();
        int removedCount = 0;
        
        for (Product product : expiredProducts) {
            if (hardDelete) {
                productRepository.deleteById(product.getId());
            } else {
                product.setStockQuantity(0);
                product.setIsExpired(true);
                productRepository.save(product);
            }
            removedCount++;
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalExpired", expiredProducts.size());
        result.put("removed", removedCount);
        result.put("hardDelete", hardDelete);
        
        return result;
    }
    
    /**
     * Lấy danh sách chi tiết sản phẩm theo lô
     */
    public Map<String, List<Product>> getProductsByBatch() {
        List<Product> allProducts = productRepository.findAll();
        
        return allProducts.stream()
                .filter(p -> p.getBatchNumber() != null && !p.getBatchNumber().isEmpty())
                .collect(Collectors.groupingBy(Product::getBatchNumber));
    }

    /**
     * Xóa nhiều sản phẩm cùng lúc
     */
    public Map<String, Object> deleteMultipleProducts(List<String> productIds) {
        Map<String, Object> result = new HashMap<>();
        List<String> deletedIds = new ArrayList<>();
        List<String> failedIds = new ArrayList<>();
        
        for (String productId : productIds) {
            try {
                if (productRepository.existsById(productId)) {
                    productRepository.deleteById(productId);
                    deletedIds.add(productId);
                } else {
                    failedIds.add(productId);
                }
            } catch (Exception e) {
                failedIds.add(productId);
            }
        }
        
        result.put("deletedCount", deletedIds.size());
        result.put("deletedIds", deletedIds);
        result.put("failedCount", failedIds.size());
        result.put("failedIds", failedIds);
        result.put("message", "Đã xóa " + deletedIds.size() + "/" + productIds.size() + " sản phẩm");
        
        return result;
    }

    /**
     * Thêm ảnh placeholder cho các sản phẩm không có ảnh
     */
    public Map<String, Object> fixMissingImages() {
        List<Product> allProducts = productRepository.findAll();
        List<String> fixedProductIds = new ArrayList<>();

        String placeholderImage = "https://via.placeholder.com/400x400?text=No+Image";

        for (Product product : allProducts) {
            if (product.getImage() == null || product.getImage().isEmpty()) {
                product.setImage(placeholderImage);
                productRepository.save(product);
                fixedProductIds.add(product.getId());
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("fixedCount", fixedProductIds.size());
        result.put("fixedProductIds", fixedProductIds);
        result.put("message", "Đã thêm ảnh placeholder cho " + fixedProductIds.size() + " sản phẩm");

        return result;
    }

    private void calculateAndSetFinalPrice(Product product) {
        if (Boolean.TRUE.equals(product.getIsClearance()) && product.getClearanceDiscount() != null) {
            product.setFinalPrice(product.getPrice() * (1 - product.getClearanceDiscount() / 100.0));
        } else {
            // Đảm bảo discount không null
            double discount = product.getDiscount() > 0 ? product.getDiscount() : 0;
            product.setFinalPrice(product.getPrice() - discount);
        }
    }
}
