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
     * Fallback: Nếu không có sản phẩm nào, lấy 8 sản phẩm đầu tiên.
     */
    @GetMapping("/bestsellers")
    public ResponseEntity<List<Product>> getBestsellers() {
        System.out.println("=== GET /api/v1/homepage/bestsellers ===");
        
        // Lấy sản phẩm được đánh dấu Bestseller
        List<Product> bestsellers = productRepository.findTop8ByIsBestSellerTrue();
        System.out.println("Bestsellers from isBestSeller=true: " + (bestsellers != null ? bestsellers.size() : 0));
        if (bestsellers == null) {
            bestsellers = new java.util.ArrayList<>();
        }
        
        // Nếu chưa đủ 8 sản phẩm, bổ sung bằng các sản phẩm bán chạy nhất
        if (bestsellers.size() < 8) {
            List<Product> topSold = productRepository.findTop8ByOrderBySoldQuantityDesc();
            System.out.println("Top sold products: " + (topSold != null ? topSold.size() : 0));
            if (topSold == null) {
                topSold = new java.util.ArrayList<>();
            }
            
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
        
        // Fallback cuối cùng: Nếu vẫn không có sản phẩm, lấy 8 sản phẩm đầu tiên
        if (bestsellers.isEmpty()) {
            List<Product> allProducts = productRepository.findAll();
            System.out.println("All products count: " + (allProducts != null ? allProducts.size() : 0));
            if (allProducts != null && !allProducts.isEmpty()) {
                int size = Math.min(8, allProducts.size());
                bestsellers = allProducts.subList(0, size);
                System.out.println("Using fallback: returning " + bestsellers.size() + " products");
            }
        }
        
        // Đảm bảo chỉ trả về tối đa 8 sản phẩm
        if (bestsellers.size() > 8) {
            bestsellers = bestsellers.subList(0, 8);
        }
        
        System.out.println("Final bestsellers count: " + bestsellers.size());
        return ResponseEntity.ok(bestsellers != null ? bestsellers : java.util.Collections.emptyList());
    }

    /**
     * Lấy danh sách nông sản theo mùa (Seasonal)
     * Tiêu chí: Chỉ lấy sản phẩm có isSeasonal=true
     * Không có fallback - nếu không có sản phẩm theo mùa thì trả về mảng rỗng
     */
    @GetMapping("/seasonal")
    public ResponseEntity<List<Product>> getSeasonalProducts() {
        System.out.println("=== GET /api/v1/homepage/seasonal ===");

        // Chỉ lấy sản phẩm được đánh dấu là theo mùa
        List<Product> seasonalProducts = productRepository.findTop6ByIsSeasonalTrue();
        System.out.println("Seasonal products from isSeasonal=true: " + (seasonalProducts != null ? seasonalProducts.size() : 0));

        if (seasonalProducts == null) {
            seasonalProducts = new java.util.ArrayList<>();
        }

        System.out.println("Final seasonal products count: " + seasonalProducts.size());
        return ResponseEntity.ok(seasonalProducts);
    }

    /**
     * Lấy danh sách sản phẩm mới nhất (Top 8 Newest)
     * Tiêu chí: Sắp xếp theo thời gian tạo (createdAt) hoặc ID giảm dần
     */
    @GetMapping("/newest")
    public ResponseEntity<List<Product>> getNewestProducts() {
        System.out.println("=== GET /api/v1/homepage/newest ===");

        List<Product> newestProducts = null;

        // Thử lấy theo createdAt trước
        try {
            newestProducts = productRepository.findTop8ByOrderByCreatedAtDesc();
            System.out.println("Newest products by createdAt: " + (newestProducts != null ? newestProducts.size() : 0));
        } catch (Exception e) {
            System.out.println("Error fetching by createdAt: " + e.getMessage());
        }

        // Fallback: Nếu không có createdAt, lấy theo ID giảm dần
        if (newestProducts == null || newestProducts.isEmpty()) {
            try {
                newestProducts = productRepository.findTop8ByOrderByIdDesc();
                System.out.println("Newest products by ID: " + (newestProducts != null ? newestProducts.size() : 0));
            } catch (Exception e) {
                System.out.println("Error fetching by ID: " + e.getMessage());
            }
        }

        // Fallback cuối: Lấy 8 sản phẩm đầu tiên
        if (newestProducts == null || newestProducts.isEmpty()) {
            List<Product> allProducts = productRepository.findAll();
            if (allProducts != null && !allProducts.isEmpty()) {
                int size = Math.min(8, allProducts.size());
                newestProducts = allProducts.subList(0, size);
                System.out.println("Using fallback: returning " + newestProducts.size() + " products");
            } else {
                newestProducts = new java.util.ArrayList<>();
            }
        }

        System.out.println("Final newest products count: " + (newestProducts != null ? newestProducts.size() : 0));
        return ResponseEntity.ok(newestProducts != null ? newestProducts : java.util.Collections.emptyList());
    }
}