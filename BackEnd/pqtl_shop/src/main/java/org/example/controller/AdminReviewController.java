package org.example.controller;

import org.example.model.ProductReview;
import org.example.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/reviews")
public class AdminReviewController {

    @Autowired
    private ProductService productService;

    /**
     * Lấy tất cả đánh giá (cho admin).
     * GET /api/v1/admin/reviews
     */
    @GetMapping
    public ResponseEntity<Page<ProductReview>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String filter) {
        
        Page<ProductReview> reviews;
        if ("unreplied".equals(filter)) {
            reviews = productService.getUnrepliedReviews(page, size);
        } else {
            reviews = productService.getAllReviews(page, size);
        }
        
        return ResponseEntity.ok(reviews);
    }
    
    /**
     * Lấy thống kê đánh giá.
     * GET /api/v1/admin/reviews/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getReviewStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("unrepliedCount", productService.countUnrepliedReviews());
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Admin phản hồi đánh giá.
     * POST /api/v1/admin/reviews/{id}/reply
     */
    @PostMapping("/{id}/reply")
    public ResponseEntity<ProductReview> replyToReview(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        
        String adminReply = body.get("adminReply");
        String adminName = body.get("adminName");
        
        ProductReview updatedReview = productService.replyToReview(id, adminReply, adminName);
        return ResponseEntity.ok(updatedReview);
    }
    
    /**
     * Ẩn/Hiện đánh giá.
     * PUT /api/v1/admin/reviews/{id}/toggle-visibility
     */
    @PutMapping("/{id}/toggle-visibility")
    public ResponseEntity<ProductReview> toggleVisibility(@PathVariable String id) {
        ProductReview updatedReview = productService.toggleReviewVisibility(id);
        return ResponseEntity.ok(updatedReview);
    }
    
    /**
     * Xóa đánh giá.
     * DELETE /api/v1/admin/reviews/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteReview(@PathVariable String id) {
        productService.deleteReview(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Đã xóa đánh giá thành công");
        return ResponseEntity.ok(response);
    }
}
