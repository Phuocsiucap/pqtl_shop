package org.example.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Data
@Document(collection = "products")
public class Product {
    @Id
    private String id;
    private String name;
    private String description;
    private String category;
    private String image;
    private double price;           // Giá bán
    private double costPrice;       // Giá nhập (giá vốn)
    private double discount;
    private Double finalPrice;
    private int stockQuantity;
    private int soldQuantity;
    private Boolean isBestSeller = false;
    private Boolean isSeasonal = false;
    private Double rating;
    private Integer reviewCount;
    private String subCategory;
    private String origin;
    private List<String> certifications;
    @CreatedDate
    private Instant createdAt;
    
    // Thêm các trường cần thiết cho admin API
    private String brand;           // Thương hiệu - cần thiết cho quản lý sản phẩm
    private String specifications;  // Thông số kỹ thuật - cần thiết cho chi tiết sản phẩm
    
    // ==================== NGÀY SẢN XUẤT & HẠN SỬ DỤNG ====================
    private LocalDate manufacturingDate;    // Ngày sản xuất (NSX)
    private LocalDate expiryDate;           // Hạn sử dụng (HSD)
    private Integer shelfLifeDays;          // Thời hạn sử dụng (số ngày)
    private String batchNumber;             // Số lô sản xuất
    private Boolean isExpired = false;      // Đã hết hạn chưa
    private Boolean isNearExpiry = false;   // Sắp hết hạn (< 30 ngày)
    private Boolean isClearance = false;    // Đang thanh lý
    private Double clearanceDiscount;       // Giảm giá thanh lý (%)
    
    public double getFinalPrice() {
        return finalPrice != null ? finalPrice : price - discount;
    }
    
    /**
     * Kiểm tra sản phẩm đã hết hạn chưa
     */
    public boolean checkExpired() {
        if (expiryDate == null) return false;
        return LocalDate.now().isAfter(expiryDate);
    }
    
    /**
     * Kiểm tra sản phẩm sắp hết hạn (mặc định 30 ngày)
     */
    public boolean checkNearExpiry() {
        return checkNearExpiry(30);
    }
    
    /**
     * Kiểm tra sản phẩm sắp hết hạn với số ngày tùy chọn
     */
    public boolean checkNearExpiry(int daysThreshold) {
        if (expiryDate == null) return false;
        long daysUntilExpiry = ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
        return daysUntilExpiry > 0 && daysUntilExpiry <= daysThreshold;
    }
    
    /**
     * Lấy số ngày còn lại trước khi hết hạn
     */
    public Long getDaysUntilExpiry() {
        if (expiryDate == null) return null;
        long days = ChronoUnit.DAYS.between(LocalDate.now(), expiryDate);
        return days;
    }
    
    /**
     * Lấy giá sau khi thanh lý
     */
    public double getClearancePrice() {
        if (isClearance != null && isClearance && clearanceDiscount != null) {
            return getFinalPrice() * (1 - clearanceDiscount / 100);
        }
        return getFinalPrice();
    }
    
    /**
     * Cập nhật trạng thái hết hạn và sắp hết hạn
     */
    public void updateExpiryStatus() {
        this.isExpired = checkExpired();
        this.isNearExpiry = checkNearExpiry();
    }
}
