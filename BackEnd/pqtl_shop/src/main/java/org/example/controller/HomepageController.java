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
     * Lấy danh sách nông sản theo mùa (Top 6 Seasonal)
     * Tiêu chí: isSeasonal=true.
     * Fallback: Nếu không có sản phẩm seasonal, lấy 6 sản phẩm mới nhất.
     */
    @GetMapping("/seasonal")
    public ResponseEntity<List<Product>> getSeasonalProducts() {
        System.out.println("=== GET /api/v1/homepage/seasonal ===");
        
        // Sử dụng phương thức đã định nghĩa trong ProductRepository
        List<Product> seasonalProducts = productRepository.findTop6ByIsSeasonalTrue();
        System.out.println("Seasonal products from isSeasonal=true: " + (seasonalProducts != null ? seasonalProducts.size() : 0));
        
        // Fallback: Nếu không có sản phẩm seasonal, lấy 6 sản phẩm mới nhất
        if (seasonalProducts == null || seasonalProducts.isEmpty()) {
            // Lấy tất cả sản phẩm, sắp xếp theo ID (giả định ID tăng dần = mới nhất)
            List<Product> allProducts = productRepository.findAll();
            System.out.println("All products count: " + (allProducts != null ? allProducts.size() : 0));
            if (allProducts != null && !allProducts.isEmpty()) {
                // Lấy 6 sản phẩm đầu tiên (hoặc có thể sắp xếp theo ngày tạo nếu có)
                int size = Math.min(6, allProducts.size());
                seasonalProducts = allProducts.subList(0, size);
                System.out.println("Using fallback: returning " + seasonalProducts.size() + " products");
            } else {
                seasonalProducts = new java.util.ArrayList<>();
            }
        }
        
        System.out.println("Final seasonal products count: " + seasonalProducts.size());
        return ResponseEntity.ok(seasonalProducts != null ? seasonalProducts : java.util.Collections.emptyList());
    }
}