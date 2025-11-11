package org.example.controller;

import org.example.model.Product;
import org.example.model.SearchHistory;
import org.example.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class SearchController {

    @Autowired
    private SearchService searchService;

    /**
     * Endpoint tìm kiếm sản phẩm đa tham số.
     * GET /api/v1/search
     * Tham số: keyword, category, priceMin, priceMax, sortBy, page, size
     */
    @GetMapping("/search")
    public ResponseEntity<Page<Product>> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double priceMin,
            @RequestParam(required = false) Double priceMax,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {

        SearchService.SearchParams params = new SearchService.SearchParams();
        params.keyword = keyword;
        params.category = category;
        params.priceMin = priceMin;
        params.priceMax = priceMax;
        params.sortBy = sortBy;
        params.page = page;
        params.size = size;

        Page<Product> products = searchService.searchProducts(params);
        return ResponseEntity.ok(products);
    }

    /**
     * Endpoint lấy lịch sử tìm kiếm gần đây của người dùng.
     * GET /api/v1/search/history
     * Giả định: userId được lấy từ context bảo mật (SecurityContextHolder)
     * Tạm thời sử dụng @RequestParam cho mục đích phát triển.
     */
    @GetMapping("/search/history")
    public ResponseEntity<List<SearchHistory>> getSearchHistory(@RequestParam(required = false) String userId) {
        // Trong thực tế, userId nên được lấy từ JWT/Security Context
        List<SearchHistory> history = searchService.getRecentSearchHistory(userId);
        return ResponseEntity.ok(history);
    }
}