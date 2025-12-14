package org.example.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
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
    private double price;
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

    // Các trường mới cho tính năng quản lý nâng cao
    private Double costPrice;       // Giá nhập
    private List<String> additionalImages; // Ảnh phụ
    
    private java.time.LocalDate manufacturingDate; // Ngày sản xuất
    private java.time.LocalDate expiryDate;        // Hạn sử dụng
    private String batchNumber;                    // Số lô
    
    private Boolean isClearance = false;           // Đang thanh lý
    private Double clearanceDiscount;              // Mức giảm giá thanh lý (%)
    private Boolean isExpired = false;             // Đã hết hạn
    private Boolean isNearExpiry = false;          // Sắp hết hạn

    public double getFinalPrice() {
        if (Boolean.TRUE.equals(isClearance) && clearanceDiscount != null) {
            return price * (1 - clearanceDiscount / 100.0);
        }
        return finalPrice != null ? finalPrice : price - discount;
    }

    // Helper methods for expiry logic
    public void updateExpiryStatus() {
        if (expiryDate == null) return;
        
        java.time.LocalDate now = java.time.LocalDate.now();
        this.isExpired = now.isAfter(expiryDate);
        
        // Sắp hết hạn nếu còn dưới 30 ngày (mặc định)
        long daysUntilExpiry = java.time.temporal.ChronoUnit.DAYS.between(now, expiryDate);
        this.isNearExpiry = !this.isExpired && daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    }

    public boolean checkExpired() {
        if (expiryDate == null) return false;
        return java.time.LocalDate.now().isAfter(expiryDate);
    }

    public boolean checkNearExpiry(int daysThreshold) {
        if (expiryDate == null) return false;
        if (checkExpired()) return false;
        
        long daysUntilExpiry = java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(), expiryDate);
        return daysUntilExpiry <= daysThreshold && daysUntilExpiry >= 0;
    }
}
