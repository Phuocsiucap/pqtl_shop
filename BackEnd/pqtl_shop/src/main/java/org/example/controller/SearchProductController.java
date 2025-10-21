package org.example.controller;
import org.example.model.Product;
import org.example.service.SearchProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class SearchProductController {

    private final SearchProductService productService;

    // API tìm kiếm sản phẩm theo từ khóa
    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String keyword) {
        return productService.searchProducts(keyword);
    }

    // API tìm kiếm theo từ khóa và danh mục
    @GetMapping("/search/category")
    public List<Product> searchProductsByCategory(
            @RequestParam String keyword,
                @RequestParam String categoryId) {
        return productService.searchProductsByCategory(keyword, categoryId);
    }
}