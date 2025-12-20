package org.example.service;

import org.example.exception.AppException;
import org.example.exception.ErrorCode;
import org.example.model.Product;
import org.example.model.ProductReview;
import org.example.repository.ProductRepository;
import org.example.repository.ProductReviewRepository;
import org.example.repository.order.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductReviewRepository reviewRepository;
    
    @Autowired
    private OrderRepository orderRepository;

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
     * Lấy đánh giá sản phẩm (chỉ những đánh giá được hiển thị).
     */
    public Page<ProductReview> getProductReviews(String productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "reviewDate"));
        return reviewRepository.findByProductIdAndIsVisibleTrue(productId, pageable);
    }
    
    /**
     * Kiểm tra người dùng đã mua sản phẩm chưa.
     */
    public boolean hasUserPurchasedProduct(String userId, String productId) {
        if (userId == null || productId == null) {
            return false;
        }
        long count = orderRepository.countDeliveredOrdersByUserIdAndProductId(userId, productId);
        return count > 0;
    }
    
    /**
     * Kiểm tra người dùng đã đánh giá sản phẩm chưa.
     */
    public boolean hasUserReviewedProduct(String userId, String productId) {
        if (userId == null || productId == null) {
            return false;
        }
        Optional<ProductReview> existingReview = reviewRepository.findByProductIdAndUserId(productId, userId);
        return existingReview.isPresent();
    }
    
    /**
     * Kiểm tra người dùng có đủ điều kiện đánh giá sản phẩm không.
     * @return Map chứa thông tin: canReview, hasPurchased, hasReviewed
     */
    public ReviewEligibility checkReviewEligibility(String userId, String productId) {
        boolean hasPurchased = hasUserPurchasedProduct(userId, productId);
        boolean hasReviewed = hasUserReviewedProduct(userId, productId);
        boolean canReview = hasPurchased && !hasReviewed;
        
        return new ReviewEligibility(canReview, hasPurchased, hasReviewed);
    }

    /**
     * Thêm đánh giá sản phẩm mới.
     * Cần cập nhật rating và reviewCount trong Product model sau khi thêm.
     */
    public ProductReview addProductReview(ProductReview review) {
        // Kiểm tra người dùng đã mua sản phẩm chưa
        if (!hasUserPurchasedProduct(review.getUserId(), review.getProductId())) {
            throw new AppException(ErrorCode.REVIEW_NOT_ALLOWED, "Bạn cần mua sản phẩm này trước khi đánh giá");
        }
        
        // Kiểm tra người dùng đã đánh giá chưa
        if (hasUserReviewedProduct(review.getUserId(), review.getProductId())) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_EXISTS, "Bạn đã đánh giá sản phẩm này rồi");
        }
        
        // Lấy tên sản phẩm để lưu vào review
        Product product = getProductDetail(review.getProductId());
        review.setProductName(product.getName());
        review.setIsApproved(true);
        review.setIsVisible(true);
        
        // 1. Lưu đánh giá
        ProductReview savedReview = reviewRepository.save(review);

        // 2. Cập nhật thống kê sản phẩm (rating, reviewCount)
        updateProductRatingStatistics(review.getProductId());

        return savedReview;
    }
    
    /**
     * Admin phản hồi đánh giá.
     */
    public ProductReview replyToReview(String reviewId, String adminReply, String adminName) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND, "Không tìm thấy đánh giá"));
        
        review.setAdminReply(adminReply);
        review.setAdminReplyBy(adminName);
        review.setAdminReplyDate(LocalDateTime.now());
        
        return reviewRepository.save(review);
    }
    
    /**
     * Lấy tất cả đánh giá (cho admin).
     */
    public Page<ProductReview> getAllReviews(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "reviewDate"));
        return reviewRepository.findAll(pageable);
    }
    
    /**
     * Lấy đánh giá chưa phản hồi (cho admin).
     */
    public Page<ProductReview> getUnrepliedReviews(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "reviewDate"));
        return reviewRepository.findByAdminReplyIsNull(pageable);
    }
    
    /**
     * Đếm số đánh giá chưa phản hồi.
     */
    public long countUnrepliedReviews() {
        return reviewRepository.countByAdminReplyIsNull();
    }
    
    /**
     * Ẩn/Hiện đánh giá.
     */
    public ProductReview toggleReviewVisibility(String reviewId) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND, "Không tìm thấy đánh giá"));
        
        review.setIsVisible(!review.getIsVisible());
        ProductReview savedReview = reviewRepository.save(review);
        
        // Cập nhật lại thống kê sản phẩm
        updateProductRatingStatistics(review.getProductId());
        
        return savedReview;
    }
    
    /**
     * Xóa đánh giá.
     */
    public void deleteReview(String reviewId) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND, "Không tìm thấy đánh giá"));
        
        String productId = review.getProductId();
        reviewRepository.delete(review);
        
        // Cập nhật lại thống kê sản phẩm
        updateProductRatingStatistics(productId);
    }

    /**
     * Tính toán lại và cập nhật rating/reviewCount cho sản phẩm.
     */
    private void updateProductRatingStatistics(String productId) {
        List<ProductReview> reviews = reviewRepository.findByProductId(productId);
        // Chỉ tính những review được hiển thị
        List<ProductReview> visibleReviews = reviews.stream()
                .filter(r -> r.getIsVisible() != null && r.getIsVisible())
                .toList();
        
        long reviewCount = visibleReviews.size();
        double averageRating = visibleReviews.stream()
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
    
    /**
     * Class chứa thông tin điều kiện đánh giá.
     */
    public static class ReviewEligibility {
        private boolean canReview;
        private boolean hasPurchased;
        private boolean hasReviewed;
        
        public ReviewEligibility(boolean canReview, boolean hasPurchased, boolean hasReviewed) {
            this.canReview = canReview;
            this.hasPurchased = hasPurchased;
            this.hasReviewed = hasReviewed;
        }
        
        public boolean isCanReview() { return canReview; }
        public boolean isHasPurchased() { return hasPurchased; }
        public boolean isHasReviewed() { return hasReviewed; }
    }
}