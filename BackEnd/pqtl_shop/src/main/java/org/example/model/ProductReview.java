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
    private String productName; // Tên sản phẩm (để hiển thị trong admin)
    private String userId; // ID người dùng đánh giá
    private String username; // Tên người dùng (để hiển thị)
    private Integer rating; // 1 đến 5
    private String comment;
    private LocalDateTime reviewDate;
    
    // Trường phản hồi của admin
    private String adminReply; // Phản hồi từ admin
    private String adminReplyBy; // Tên admin phản hồi
    private LocalDateTime adminReplyDate; // Ngày phản hồi
    
    // Trạng thái đánh giá
    private Boolean isApproved = true; // Mặc định được duyệt
    private Boolean isVisible = true; // Hiển thị hay ẩn

    public ProductReview() {
        this.reviewDate = LocalDateTime.now();
    }
}