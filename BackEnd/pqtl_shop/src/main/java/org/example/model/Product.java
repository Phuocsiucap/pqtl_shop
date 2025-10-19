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
    private String image;        // URL ảnh
    private double price;
    private double discount;
    private int stockQuantity;
    private int soldQuantity;

    public double getFinalPrice() {
        return price - discount;
    }
}
