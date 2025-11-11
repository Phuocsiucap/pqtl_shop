package org.example.repository;

import org.example.model.ProductReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ProductReviewRepository extends MongoRepository<ProductReview, String> {
    // Lấy tất cả đánh giá cho một sản phẩm, phân trang
    Page<ProductReview> findByProductId(String productId, Pageable pageable);

    // Lấy tất cả đánh giá cho một sản phẩm
    List<ProductReview> findByProductId(String productId);
}