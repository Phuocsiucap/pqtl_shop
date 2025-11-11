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
    private String category; // Bổ sung cho tìm kiếm
    private String image;        // URL ảnh
    private double price;
    private double discount;
    private int stockQuantity;
    private int soldQuantity;
    private Boolean isBestSeller = false; // Bổ sung cho trang chủ
    private Boolean isSeasonal = false; // Bổ sung cho trang chủ
    private Double rating; // Bổ sung cho chi tiết/tìm kiếm
    private Integer reviewCount; // Bổ sung cho chi tiết/tìm kiếm

    public double getFinalPrice() {
        return price - discount;
    }
}
