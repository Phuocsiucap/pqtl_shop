package org.example.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

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
    private int stockQuantity;
    private int soldQuantity;
    private Boolean isBestSeller = false;
    private Boolean isSeasonal = false;
    private Double rating;
    private Integer reviewCount;
    
    // Thêm các trường cần thiết cho admin API
    private String brand;           // Thương hiệu - cần thiết cho quản lý sản phẩm
    private String specifications;  // Thông số kỹ thuật - cần thiết cho chi tiết sản phẩm

    public double getFinalPrice() {
        return price - discount;
    }
}
