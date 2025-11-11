package org.example.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "product_reviews")
public class ProductReview {
    @Id
    private String id;
    private String productId;
    private String userId; // ID người dùng đánh giá
    private String username; // Tên người dùng (để hiển thị)
    private Integer rating; // 1 đến 5
    private String comment;
    private LocalDateTime reviewDate;

    public ProductReview() {
        this.reviewDate = LocalDateTime.now();
    }
}