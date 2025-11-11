package org.example.service;

import org.example.model.Product;
import org.example.model.SearchHistory;
import org.example.repository.ProductRepository;
import org.example.repository.SearchHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;

@Service
public class SearchService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SearchHistoryRepository searchHistoryRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    // DTO cho tham số tìm kiếm (tạo tạm thời ở đây, lý tưởng nên đặt trong package dto/request)
    public static class SearchParams {
        public String keyword;
        public String category;
        public Double priceMin;
        public Double priceMax;
        public String sortBy; // e.g., price_asc, price_desc, rating_desc, sold_desc
        public Integer page = 0;
        public Integer size = 10;
    }

    /**
     * Thực hiện tìm kiếm sản phẩm đa tham số.
     * US1.1, US1.3, US1.4
     */
    public Page<Product> searchProducts(SearchParams params) {
        Query query = new Query();
        Criteria criteria = new Criteria();

        // 1. Lọc theo Keyword (US1.1)
        if (StringUtils.hasText(params.keyword)) {
            // Sử dụng $or cho tên hoặc mô tả
            Criteria keywordCriteria = new Criteria().orOperator(
                    Criteria.where("name").regex(params.keyword, "i"),
                    Criteria.where("description").regex(params.keyword, "i")
            );
            query.addCriteria(keywordCriteria);
        }

        // 2. Lọc theo Category (US1.3)
        if (StringUtils.hasText(params.category)) {
            query.addCriteria(Criteria.where("category").is(params.category));
        }

        // 3. Lọc theo Giá (US1.4)
        if (params.priceMin != null || params.priceMax != null) {
            Criteria priceCriteria = Criteria.where("finalPrice"); // Giả sử có trường finalPrice hoặc dùng getFinalPrice()
            if (params.priceMin != null) {
                priceCriteria.gte(params.priceMin);
            }
            if (params.priceMax != null) {
                priceCriteria.lte(params.priceMax);
            }
            query.addCriteria(priceCriteria);
        }
        
        // 4. Sắp xếp (US1.4)
        Sort sort = Sort.unsorted();
        if (StringUtils.hasText(params.sortBy)) {
            switch (params.sortBy.toLowerCase()) {
                case "price_asc":
                    sort = Sort.by(Sort.Direction.ASC, "price");
                    break;
                case "price_desc":
                    sort = Sort.by(Sort.Direction.DESC, "price");
                    break;
                case "rating_desc":
                    sort = Sort.by(Sort.Direction.DESC, "rating");
                    break;
                case "sold_desc":
                    sort = Sort.by(Sort.Direction.DESC, "soldQuantity");
                    break;
                default:
                    // Mặc định sắp xếp theo relevance hoặc không sắp xếp
                    break;
            }
        }
        
        Pageable pageable = PageRequest.of(params.page, params.size, sort);
        query.with(pageable);

        long total = mongoTemplate.count(query, Product.class);
        List<Product> products = mongoTemplate.find(query, Product.class);

        // Ghi lại lịch sử tìm kiếm nếu có keyword
        if (StringUtils.hasText(params.keyword)) {
            saveSearchHistory(params.keyword, null); // Giả sử userId là null nếu chưa xác thực
        }

        return new org.springframework.data.domain.PageImpl<>(products, pageable, total);
    }

    /**
     * Thực hiện tìm kiếm toàn văn (Full-Text Search)
     * US1.6
     */
    public Page<Product> fullTextSearch(String text, Pageable pageable) {
        // Hàm này yêu cầu MongoDB text index.
        // Chúng ta sẽ sử dụng hàm đã định nghĩa trong ProductRepository
        return productRepository.findByFullTextSearch(text, pageable);
    }

    /**
     * Ghi lại lịch sử tìm kiếm
     * US1.5
     */
    public void saveSearchHistory(String keyword, String userId) {
        if (StringUtils.hasText(keyword)) {
            SearchHistory history = new SearchHistory();
            history.setKeyword(keyword);
            history.setUserId(userId);
            searchHistoryRepository.save(history);
        }
    }

    /**
     * Lấy lịch sử tìm kiếm gần đây của người dùng
     * US1.5
     */
    public List<SearchHistory> getRecentSearchHistory(String userId) {
        // Nếu userId là null (người dùng chưa đăng nhập), trả về danh sách rỗng
        if (!StringUtils.hasText(userId)) {
            return List.of();
        }
        return searchHistoryRepository.findTop10ByUserIdOrderBySearchDateDesc(userId);
    }
}