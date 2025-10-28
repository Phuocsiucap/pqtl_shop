package org.example.controller;

import org.example.model.Product;
import org.example.service.SearchProductService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class SearchProductController {

    private final SearchProductService service;

    public SearchProductController(SearchProductService service) {
        this.service = service;
    }

    // Lấy tất cả sản phẩm
    @GetMapping
    public List<Product> getAllProducts() {
        return service.getAllProducts();
    }

    // Tìm kiếm sản phẩm
    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String keyword) {
        return service.searchProducts(keyword);
    }
}
