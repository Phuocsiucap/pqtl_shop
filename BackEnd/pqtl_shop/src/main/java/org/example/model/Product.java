package org.example.model;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "products")
@Data // Tạo getter, setter, toString, hashCode, equals
@NoArgsConstructor // Tạo constructor không tham số
@AllArgsConstructor // Tạo constructor đầy đủ tham số
public class Product {
    @Id
    private String id;
    private String name;
    private String description;
    private String categoryId;
    private double price;
    private double rating;
}
