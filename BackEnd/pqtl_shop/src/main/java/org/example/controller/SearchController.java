package org.example.controller;

import org.example.model.Product;
import org.example.model.SearchHistory;
import org.example.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
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
            @RequestParam(required = false) List<String> categories,
            @RequestParam(required = false, name = "categoriesCsv") String categoriesCsv,
            @RequestParam(required = false) String subCategory,
            @RequestParam(required = false) List<String> subCategories,
            @RequestParam(required = false, name = "subCategoriesCsv") String subCategoriesCsv,
            @RequestParam(required = false) Double priceMin,
            @RequestParam(required = false) Double priceMax,
            @RequestParam(required = false) List<String> origins,
            @RequestParam(required = false, name = "originsCsv") String originsCsv,
            @RequestParam(required = false) List<String> certifications,
            @RequestParam(required = false, name = "certificationsCsv") String certificationsCsv,
            @RequestParam(required = false) Double ratingMin,
            @RequestParam(required = false) Boolean onSaleOnly,
            @RequestParam(required = false) Boolean isSeasonal,
            @RequestParam(required = false) Boolean isClearance,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {

        SearchService.SearchParams params = buildSearchParams(
                keyword,
                category,
                categories,
                categoriesCsv,
                subCategory,
                subCategories,
                subCategoriesCsv,
                priceMin,
                priceMax,
                origins,
                originsCsv,
                certifications,
                certificationsCsv,
                ratingMin,
                onSaleOnly,
                isSeasonal,
                isClearance,
                sortBy,
                page,
                size
        );

        Page<Product> products = searchService.searchProducts(params);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/search/filters")
    public ResponseEntity<SearchService.FilterMetadata> getFilterMetadata(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) List<String> categories,
            @RequestParam(required = false, name = "categoriesCsv") String categoriesCsv,
            @RequestParam(required = false) String subCategory,
            @RequestParam(required = false) List<String> subCategories,
            @RequestParam(required = false, name = "subCategoriesCsv") String subCategoriesCsv,
            @RequestParam(required = false) Double priceMin,
            @RequestParam(required = false) Double priceMax,
            @RequestParam(required = false) List<String> origins,
            @RequestParam(required = false, name = "originsCsv") String originsCsv,
            @RequestParam(required = false) List<String> certifications,
            @RequestParam(required = false, name = "certificationsCsv") String certificationsCsv,
            @RequestParam(required = false) Double ratingMin,
            @RequestParam(required = false) Boolean onSaleOnly,
            @RequestParam(required = false) Boolean isSeasonal,
            @RequestParam(required = false) Boolean isClearance) {

        SearchService.SearchParams params = buildSearchParams(
                keyword,
                category,
                categories,
                categoriesCsv,
                subCategory,
                subCategories,
                subCategoriesCsv,
                priceMin,
                priceMax,
                origins,
                originsCsv,
                certifications,
                certificationsCsv,
                ratingMin,
                onSaleOnly,
                isSeasonal,
                isClearance,
                null,
                0,
                Integer.MAX_VALUE
        );

        return ResponseEntity.ok(searchService.getFilterMetadata(params));
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

    private SearchService.SearchParams buildSearchParams(
            String keyword,
            String category,
            List<String> categories,
            String categoriesCsv,
            String subCategory,
            List<String> subCategories,
            String subCategoriesCsv,
            Double priceMin,
            Double priceMax,
            List<String> origins,
            String originsCsv,
            List<String> certifications,
            String certificationsCsv,
            Double ratingMin,
            Boolean onSaleOnly,
            Boolean isSeasonal,
            Boolean isClearance,
            String sortBy,
            Integer page,
            Integer size) {

        SearchService.SearchParams params = new SearchService.SearchParams();
        params.keyword = keyword;
        params.category = category;
        params.categories = mergeParamValues(categories, categoriesCsv);
        params.subCategory = subCategory;
        params.subCategories = mergeParamValues(subCategories, subCategoriesCsv);
        params.priceMin = priceMin;
        params.priceMax = priceMax;
        params.origins = mergeParamValues(origins, originsCsv);
        params.certifications = mergeParamValues(certifications, certificationsCsv);
        params.ratingMin = ratingMin;
        params.onSaleOnly = onSaleOnly;
        params.isSeasonal = isSeasonal;
        params.isClearance = isClearance;
        params.sortBy = sortBy;
        params.page = page != null ? page : 0;
        params.size = size != null ? size : 10;
        return params;
    }

    private List<String> mergeParamValues(List<String> values, String csv) {
        List<String> merged = values != null ? new ArrayList<>(values) : new ArrayList<>();
        if (StringUtils.hasText(csv)) {
            String[] tokens = csv.split(",");
            for (String token : tokens) {
                String trimmed = token.trim();
                if (StringUtils.hasText(trimmed)) {
                    merged.add(trimmed);
                }
            }
        }
        return merged.isEmpty() ? null : merged;
    }
}