package org.example.service;

import org.example.exception.AppException;
import org.example.exception.ErrorCode;
import org.example.model.Product;
import org.example.model.ProductReview;
import org.example.repository.ProductRepository;
import org.example.repository.ProductReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductReviewRepository reviewRepository;

    /**
     * Lấy chi tiết sản phẩm theo ID.
     * US2.1, US2.2, US2.3, US2.5
     */
    public Product getProductDetail(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
    }

    /**
     * Lấy các sản phẩm tương tự (dựa trên Category).
     * US2.4
     */
    public List<Product> getSimilarProducts(String productId, String category) {
        // Sử dụng hàm đã định nghĩa trong ProductRepository
        return productRepository.findTop4ByCategoryAndIdNot(category, productId);
    }

    /**
     * Lấy đánh giá sản phẩm.
     */
    public Page<ProductReview> getProductReviews(String productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return reviewRepository.findByProductId(productId, pageable);
    }

    /**
     * Thêm đánh giá sản phẩm mới.
     * Cần cập nhật rating và reviewCount trong Product model sau khi thêm.
     */
    public ProductReview addProductReview(ProductReview review) {
        // 1. Lưu đánh giá
        ProductReview savedReview = reviewRepository.save(review);

        // 2. Cập nhật thống kê sản phẩm (rating, reviewCount)
        updateProductRatingStatistics(review.getProductId());

        return savedReview;
    }

    /**
     * Tính toán lại và cập nhật rating/reviewCount cho sản phẩm.
     */
    private void updateProductRatingStatistics(String productId) {
        List<ProductReview> reviews = reviewRepository.findByProductId(productId);
        long reviewCount = reviews.size();
        double averageRating = reviews.stream()
                .mapToInt(ProductReview::getRating)
                .average()
                .orElse(0.0);

        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isPresent()) {
            Product product = productOpt.get();
            product.setReviewCount((int) reviewCount);
            product.setRating(Math.round(averageRating * 10.0) / 10.0); // Làm tròn 1 chữ số thập phân
            productRepository.save(product);
        }
    }
}