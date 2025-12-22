package org.example.controller;

import org.example.model.Product;
import org.example.model.ProductReview;
import org.example.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    /**
     * Lấy tất cả sản phẩm.
     * GET /api/v1/products/
     */
    @GetMapping("/")
    public ResponseEntity<List<Product>> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    /**
     * Lấy sản phẩm thanh lý.
     * GET /api/v1/products/clearance
     */
    @GetMapping("/clearance")
    public ResponseEntity<List<Product>> getClearanceProducts() {
        List<Product> clearanceProducts = productService.getClearanceProducts();
        return ResponseEntity.ok(clearanceProducts);
    }

    /**
     * US2.1-2.5: Lấy chi tiết sản phẩm theo ID.
     * GET /api/v1/products/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductDetail(@PathVariable String id) {
        Product product = productService.getProductDetail(id);
        return ResponseEntity.ok(product);
    }

    /**
     * US2.4: Lấy các sản phẩm tương tự.
     * GET /api/v1/products/{id}/similar
     */
    @GetMapping("/{id}/similar")
    public ResponseEntity<List<Product>> getSimilarProducts(@PathVariable String id, @RequestParam String category) {
        List<Product> similarProducts = productService.getSimilarProducts(id, category);
        return ResponseEntity.ok(similarProducts);
    }

    /**
     * Lấy đánh giá sản phẩm.
     * GET /api/v1/products/{id}/reviews
     */
    @GetMapping("/{id}/reviews")
    public ResponseEntity<Page<ProductReview>> getProductReviews(
            @PathVariable String id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        Page<ProductReview> reviews = productService.getProductReviews(id, page, size);
        return ResponseEntity.ok(reviews);
    }
    
    /**
     * Kiểm tra điều kiện đánh giá sản phẩm.
     * GET /api/v1/products/{id}/review-eligibility
     */
    @GetMapping("/{id}/review-eligibility")
    public ResponseEntity<Map<String, Object>> checkReviewEligibility(
            @PathVariable String id,
            @RequestParam String userId) {
        ProductService.ReviewEligibility eligibility = productService.checkReviewEligibility(userId, id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("canReview", eligibility.isCanReview());
        response.put("hasPurchased", eligibility.isHasPurchased());
        response.put("hasReviewed", eligibility.isHasReviewed());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Thêm đánh giá sản phẩm mới.
     * POST /api/v1/products/{id}/reviews
     */
    @PostMapping("/{id}/reviews")
    public ResponseEntity<ProductReview> addProductReview(
            @PathVariable String id,
            @RequestBody ProductReview review) {
        
        // Đảm bảo review liên kết với đúng sản phẩm
        review.setProductId(id);
        
        // Service sẽ kiểm tra điều kiện mua hàng và đánh giá trùng lặp
        ProductReview savedReview = productService.addProductReview(review);
        return ResponseEntity.status(201).body(savedReview);
    }
}