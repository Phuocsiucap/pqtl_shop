package org.example.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.model.Order;
import org.example.model.Product;
import org.example.model.login.User;
import org.example.repository.ProductRepository;
import org.example.repository.login.UserRepository;
import org.example.repository.order.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
    private CloudinaryService cloudinaryService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ObjectMapper objectMapper;

    // Đường dẫn lưu ảnh
    private static final String UPLOAD_DIR = "uploads/products/";

    // ==================== AUTHENTICATION ====================
    /**
     * Admin login - Kiểm tra username/password
     */
    public Map<String, Object> adminLogin(String username, String password) throws Exception {
        Optional<User> user = userRepository.findByUsername(username);
        
        if (user.isEmpty()) {
            throw new Exception("Tài khoản không tồn tại");
        }
        
        User adminUser = user.get();
        
        // Kiểm tra password (trong thực tế nên dùng BCryptPasswordEncoder)
        if (!adminUser.getPassword().equals(password)) {
            throw new Exception("Mật khẩu không chính xác");
        }
        
        // Kiểm tra quyền admin
        if (adminUser.getRole() == null || !adminUser.getRole().equals("ADMIN")) {
            throw new Exception("Người dùng không có quyền admin");
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", "token_" + adminUser.getId());
        response.put("refreshToken", "refresh_" + adminUser.getId());
        response.put("user", adminUser);
        
        return response;
    }

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
     * Lấy tất cả sản phẩm
     */
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    /**
     * Tạo sản phẩm mới với upload ảnh
     */
    public Product createProduct(String goodJson, MultipartFile imageFile, MultipartFile[] additionalImages) throws IOException {
        // Parse JSON từ request
        Product product = objectMapper.readValue(goodJson, Product.class);
        
        // Xử lý upload ảnh chính
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                Map uploadResult = cloudinaryService.uploadFile(imageFile);
                System.out.println("Cloudinary Upload Result: " + uploadResult);
                String imageUrl = cloudinaryService.getImageUrl(uploadResult);
                if (imageUrl != null) {
                    System.out.println("Cloudinary URL: " + imageUrl);
                    product.setImage(imageUrl);
                } else {
                    System.out.println("Cloudinary URL is null, falling back to local storage");
                    String imagePath = saveImage(imageFile);
                    product.setImage(imagePath);
                }
            } catch (Exception ex) {
                System.out.println("Cloudinary Upload Failed: " + ex.getMessage());
                ex.printStackTrace();
                String imagePath = saveImage(imageFile);
                product.setImage(imagePath);
            }
        }
        
        // Xử lý upload các ảnh bổ sung
        if (additionalImages != null && additionalImages.length > 0) {
            List<String> additionalImageUrls = new ArrayList<>();
            for (MultipartFile additionalImage : additionalImages) {
                if (additionalImage != null && !additionalImage.isEmpty()) {
                    try {
                        Map uploadResult = cloudinaryService.uploadFile(additionalImage);
                        System.out.println("Additional Image Cloudinary Upload Result: " + uploadResult);
                        String imageUrl = cloudinaryService.getImageUrl(uploadResult);
                        if (imageUrl != null) {
                            System.out.println("Additional Image Cloudinary URL: " + imageUrl);
                            additionalImageUrls.add(imageUrl);
                        } else {
                            System.out.println("Additional Image Cloudinary URL is null, falling back to local storage");
                            String imagePath = saveImage(additionalImage);
                            additionalImageUrls.add(imagePath);
                        }
                    } catch (Exception ex) {
                        System.out.println("Additional Image Cloudinary Upload Failed: " + ex.getMessage());
                        ex.printStackTrace();
                        String imagePath = saveImage(additionalImage);
                        additionalImageUrls.add(imagePath);
                    }
                }
            }
            product.setAdditionalImages(additionalImageUrls);
        }
        
        // Gán giá trị mặc định
        if (product.getStockQuantity() == 0) {
            product.setStockQuantity(0);
        }
        
        return productRepository.save(product);
    }

    /**
     * Cập nhật sản phẩm
     */
    public Product updateProduct(String id, String goodJson, MultipartFile imageFile, MultipartFile[] additionalImages) throws IOException {
        Optional<Product> productOpt = productRepository.findById(id);
        
        if (productOpt.isEmpty()) {
            throw new IllegalArgumentException("Sản phẩm không tồn tại");
        }
        
        Product product = productOpt.get();
        
        // Parse JSON từ request
        Product updatedData = objectMapper.readValue(goodJson, Product.class);
        
        // Cập nhật các trường
        if (updatedData.getName() != null) product.setName(updatedData.getName());
        if (updatedData.getStockQuantity() >= 0) product.setStockQuantity(updatedData.getStockQuantity());
        if (updatedData.getPrice() >= 0) product.setPrice(updatedData.getPrice());
        if (updatedData.getDescription() != null) product.setDescription(updatedData.getDescription());
        if (updatedData.getSpecifications() != null) product.setSpecifications(updatedData.getSpecifications());
        if (updatedData.getBrand() != null) product.setBrand(updatedData.getBrand());
        if (updatedData.getCategory() != null) product.setCategory(updatedData.getCategory());
        if (updatedData.getSubCategory() != null) product.setSubCategory(updatedData.getSubCategory());
        if (updatedData.getDiscount() >= 0) product.setDiscount(updatedData.getDiscount());
        if (updatedData.getLowStockThreshold() >= 0) product.setLowStockThreshold(updatedData.getLowStockThreshold());
        if (updatedData.getStatus() != null) product.setStatus(updatedData.getStatus());
        if (updatedData.getOrigin() != null) product.setOrigin(updatedData.getOrigin());
        if (updatedData.getManufacturingDate() != null) product.setManufacturingDate(updatedData.getManufacturingDate());
        if (updatedData.getExpiryDate() != null) product.setExpiryDate(updatedData.getExpiryDate());
        if (updatedData.getTags() != null) product.setTags(updatedData.getTags());
        if (updatedData.getCertifications() != null) product.setCertifications(updatedData.getCertifications());
        if (updatedData.getSizes() != null) product.setSizes(updatedData.getSizes());
        if (updatedData.getIsBestSeller() != null) product.setIsBestSeller(updatedData.getIsBestSeller());
        if (updatedData.getIsSeasonal() != null) product.setIsSeasonal(updatedData.getIsSeasonal());

        // Xử lý upload ảnh chính mới
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                // Xóa ảnh cũ nếu có
                String oldImageUrl = product.getImage();
                if (oldImageUrl != null && oldImageUrl.contains("cloudinary.com")) {
                    try {
                        // Extract public ID from URL
                        int uploadIndex = oldImageUrl.indexOf("upload/");
                        if (uploadIndex != -1) {
                            String path = oldImageUrl.substring(uploadIndex + 7); // skip "upload/"
                            // skip version if present (starts with v and numbers)
                            if (path.startsWith("v")) {
                                int slashIndex = path.indexOf("/");
                                if (slashIndex != -1) {
                                    path = path.substring(slashIndex + 1);
                                }
                            }
                            // Remove extension
                            if (path.contains(".")) {
                                path = path.substring(0, path.lastIndexOf("."));
                            }
                            // Decode URL if needed (e.g. spaces)
                            path = java.net.URLDecoder.decode(path, java.nio.charset.StandardCharsets.UTF_8);
                            
                            System.out.println("Deleting old image from Cloudinary, publicId: " + path);
                            cloudinaryService.deleteFile(path);
                        }
                    } catch (Exception e) {
                        System.err.println("Failed to delete old image: " + e.getMessage());
                    }
                }

                Map uploadResult = cloudinaryService.uploadFile(imageFile);
                System.out.println("Cloudinary Upload Result (Update): " + uploadResult);
                String imageUrl = cloudinaryService.getImageUrl(uploadResult);
                if (imageUrl != null) {
                    product.setImage(imageUrl);
                } else {
                    System.out.println("Cloudinary URL is null (Update), falling back to local storage");
                    String imagePath = saveImage(imageFile);
                    product.setImage(imagePath);
                }
            } catch (Exception ex) {
                System.out.println("Cloudinary Upload Failed (Update): " + ex.getMessage());
                ex.printStackTrace();
                String imagePath = saveImage(imageFile);
                product.setImage(imagePath);
            }
        }
        
        // Xử lý upload các ảnh bổ sung mới
        if (additionalImages != null && additionalImages.length > 0) {
            // Xóa các ảnh bổ sung cũ từ Cloudinary nếu có
            List<String> oldAdditionalImages = product.getAdditionalImages();
            if (oldAdditionalImages != null && !oldAdditionalImages.isEmpty()) {
                for (String oldImageUrl : oldAdditionalImages) {
                    if (oldImageUrl != null && oldImageUrl.contains("cloudinary.com")) {
                        try {
                            int uploadIndex = oldImageUrl.indexOf("upload/");
                            if (uploadIndex != -1) {
                                String path = oldImageUrl.substring(uploadIndex + 7);
                                if (path.startsWith("v")) {
                                    int slashIndex = path.indexOf("/");
                                    if (slashIndex != -1) {
                                        path = path.substring(slashIndex + 1);
                                    }
                                }
                                if (path.contains(".")) {
                                    path = path.substring(0, path.lastIndexOf("."));
                                }
                                path = java.net.URLDecoder.decode(path, java.nio.charset.StandardCharsets.UTF_8);
                                System.out.println("Deleting old additional image from Cloudinary, publicId: " + path);
                                cloudinaryService.deleteFile(path);
                            }
                        } catch (Exception e) {
                            System.err.println("Failed to delete old additional image: " + e.getMessage());
                        }
                    }
                }
            }
            
            // Upload các ảnh bổ sung mới
            List<String> additionalImageUrls = new ArrayList<>();
            for (MultipartFile additionalImage : additionalImages) {
                if (additionalImage != null && !additionalImage.isEmpty()) {
                    try {
                        Map uploadResult = cloudinaryService.uploadFile(additionalImage);
                        System.out.println("Additional Image Cloudinary Upload Result (Update): " + uploadResult);
                        String imageUrl = cloudinaryService.getImageUrl(uploadResult);
                        if (imageUrl != null) {
                            System.out.println("Additional Image Cloudinary URL (Update): " + imageUrl);
                            additionalImageUrls.add(imageUrl);
                        } else {
                            System.out.println("Additional Image Cloudinary URL is null (Update), falling back to local storage");
                            String imagePath = saveImage(additionalImage);
                            additionalImageUrls.add(imagePath);
                        }
                    } catch (Exception ex) {
                        System.out.println("Additional Image Cloudinary Upload Failed (Update): " + ex.getMessage());
                        ex.printStackTrace();
                        String imagePath = saveImage(additionalImage);
                        additionalImageUrls.add(imagePath);
                    }
                }
            }
            product.setAdditionalImages(additionalImageUrls);
        }
        
        return productRepository.save(product);
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

    /**
     * Lưu ảnh vào thư mục
     */
    private String saveImage(MultipartFile imageFile) throws IOException {
        // Tạo thư mục nếu chưa tồn tại
        Path uploadPath = Paths.get(UPLOAD_DIR);
        Files.createDirectories(uploadPath);
        
        // Tạo tên file duy nhất
        String fileName = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        
        // Lưu file
        Files.copy(imageFile.getInputStream(), filePath);
        
        return fileName;
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
}
