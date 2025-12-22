package org.example.repository;

import org.example.model.ProductReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ProductReviewRepository extends MongoRepository<ProductReview, String> {
    // Lấy tất cả đánh giá cho một sản phẩm, phân trang
    Page<ProductReview> findByProductId(String productId, Pageable pageable);
    
    // Lấy tất cả đánh giá hiển thị cho một sản phẩm (isVisible = true), phân trang
    Page<ProductReview> findByProductIdAndIsVisibleTrue(String productId, Pageable pageable);

    // Lấy tất cả đánh giá cho một sản phẩm
    List<ProductReview> findByProductId(String productId);
    
    // Kiểm tra người dùng đã đánh giá sản phẩm chưa
    Optional<ProductReview> findByProductIdAndUserId(String productId, String userId);
    
    // Lấy tất cả đánh giá của một người dùng
    List<ProductReview> findByUserId(String userId);
    
    // Lấy tất cả đánh giá (cho admin)
    Page<ProductReview> findAll(Pageable pageable);
    
    // Lấy đánh giá chưa có phản hồi (cho admin)
    Page<ProductReview> findByAdminReplyIsNull(Pageable pageable);
    
    // Lấy đánh giá theo rating
    Page<ProductReview> findByRating(Integer rating, Pageable pageable);
    
    // Đếm số đánh giá chưa phản hồi
    long countByAdminReplyIsNull();
}