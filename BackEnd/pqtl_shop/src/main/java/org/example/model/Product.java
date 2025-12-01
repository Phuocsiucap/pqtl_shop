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

    // --- Bổ sung cho User Stories ---

    // US1.1, US1.2: Từ khóa tìm kiếm và gợi ý
    private List<String> tags;

    // US2.1: Danh sách hình ảnh chi tiết (ngoài ảnh đại diện)
    private List<String> additionalImages;

    // US2.1: Kích cỡ sản phẩm (nếu có)
    private List<String> sizes;

    // Epic 09: Quản lý sản phẩm quá hạn
    private Instant manufacturingDate; // Ngày sản xuất
    private Instant expiryDate;        // Hạn sử dụng

    // US13.2: Cảnh báo sắp hết hàng
    private int lowStockThreshold;

    // Epic 10: Trạng thái sản phẩm (ACTIVE, INACTIVE, LIQUIDATION...)
    private String status;

    // Hỗ trợ thống kê/gợi ý
    private int viewCount;

    public double getFinalPrice() {
        return finalPrice != null ? finalPrice : price - discount;
    }
}
