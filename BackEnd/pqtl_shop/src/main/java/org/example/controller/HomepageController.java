package org.example.controller;

import org.example.model.Product;
import org.example.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/homepage")
public class HomepageController {

    @Autowired
    private ProductRepository productRepository;

    /**
     * Lấy danh sách sản phẩm bán chạy nhất (Top 8 Bestsellers)
     * Tiêu chí: isBestSeller=true HOẶC sắp xếp theo soldQuantity giảm dần.
     */
    @GetMapping("/bestsellers")
    public ResponseEntity<List<Product>> getBestsellers() {
        // Lấy sản phẩm được đánh dấu Bestseller
        List<Product> bestsellers = productRepository.findTop8ByIsBestSellerTrue();
        
        // Nếu chưa đủ 8 sản phẩm, bổ sung bằng các sản phẩm bán chạy nhất
        if (bestsellers.size() < 8) {
            List<Product> topSold = productRepository.findTop8ByOrderBySoldQuantityDesc();
            
            // Sử dụng Set để loại bỏ trùng lặp và duy trì thứ tự (LinkedHashSet)
            java.util.Set<Product> uniqueBestsellers = new java.util.LinkedHashSet<>(bestsellers);
            
            for (Product p : topSold) {
                if (uniqueBestsellers.size() < 8) {
                    uniqueBestsellers.add(p);
                } else {
                    break;
                }
            }
            
            bestsellers = new java.util.ArrayList<>(uniqueBestsellers);
        }
        
        // Đảm bảo chỉ trả về tối đa 8 sản phẩm
        if (bestsellers.size() > 8) {
            bestsellers = bestsellers.subList(0, 8);
        }
        
        return ResponseEntity.ok(bestsellers);
    }

    /**
     * Lấy danh sách nông sản theo mùa (Top 6 Seasonal)
     * Tiêu chí: isSeasonal=true.
     */
    @GetMapping("/seasonal")
    public ResponseEntity<List<Product>> getSeasonalProducts() {
        // Sử dụng phương thức đã định nghĩa trong ProductRepository
        List<Product> seasonalProducts = productRepository.findTop6ByIsSeasonalTrue();
        return ResponseEntity.ok(seasonalProducts);
    }
}