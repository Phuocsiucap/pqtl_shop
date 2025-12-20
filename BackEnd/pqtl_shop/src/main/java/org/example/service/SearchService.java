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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

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
        public List<String> categories;
        public String subCategory;
        public List<String> subCategories;
        public Double priceMin;
        public Double priceMax;
        public List<String> origins;
        public List<String> certifications;
        public Double ratingMin;
        public Boolean onSaleOnly;
        public Boolean isSeasonal;
        public Boolean isClearance;
        public String sortBy; // e.g., price_asc, price_desc, rating_desc, sold_desc
        public Integer page = 0;
        public Integer size = 10;

        public SearchParams copy() {
            SearchParams copy = new SearchParams();
            copy.keyword = this.keyword;
            copy.category = this.category;
            copy.categories = this.categories != null ? new ArrayList<>(this.categories) : null;
            copy.subCategory = this.subCategory;
            copy.subCategories = this.subCategories != null ? new ArrayList<>(this.subCategories) : null;
            copy.priceMin = this.priceMin;
            copy.priceMax = this.priceMax;
            copy.origins = this.origins != null ? new ArrayList<>(this.origins) : null;
            copy.certifications = this.certifications != null ? new ArrayList<>(this.certifications) : null;
            copy.ratingMin = this.ratingMin;
            copy.onSaleOnly = this.onSaleOnly;
            copy.isSeasonal = this.isSeasonal;
            copy.isClearance = this.isClearance;
            copy.sortBy = this.sortBy;
            copy.page = this.page;
            copy.size = this.size;
            return copy;
        }
    }

    /**
     * Thực hiện tìm kiếm sản phẩm đa tham số.
     * US1.1, US1.3, US1.4
     */
    public Page<Product> searchProducts(SearchParams params) {
        Query baseQuery = buildQuery(params);
        Sort sort = resolveSort(params.sortBy);
        int pageIndex = params.page != null ? params.page : 0;
        int pageSize = params.size != null ? params.size : 10;
        Pageable pageable = PageRequest.of(pageIndex, pageSize, sort);

        // Debug: Log query để kiểm tra
        System.out.println("Search Query: " + baseQuery.toString());
        System.out.println("Search Params - keyword: " + params.keyword + ", category: " + params.category);
        
        long total = mongoTemplate.count(baseQuery, Product.class);
        System.out.println("Total products found: " + total);
        
        Query pagedQuery = baseQuery.with(pageable);
        List<Product> products = mongoTemplate.find(pagedQuery, Product.class);
        System.out.println("Products returned: " + products.size());

        if (StringUtils.hasText(params.keyword)) {
            saveSearchHistory(params.keyword, null);
        }

        return new org.springframework.data.domain.PageImpl<>(products, pageable, total);
    }

    public FilterMetadata getFilterMetadata(SearchParams params) {
        FilterMetadata metadata = new FilterMetadata();

        List<Product> products = mongoTemplate.find(buildQuery(params), Product.class);
        metadata.categories = computeCounts(products, Product::getCategory);
        metadata.subCategories = computeCounts(products, Product::getSubCategory);
        metadata.origins = computeCounts(products, Product::getOrigin);
        metadata.certifications = computeListCounts(products, Product::getCertifications);

        metadata.ratings = computeRatingBuckets(params);
        metadata.onSaleCount = computeOnSaleCount(params);
        metadata.seasonalCount = computeSeasonalCount(params);
        metadata.clearanceCount = computeClearanceCount(params);

        double[] priceRange = computePriceRange(params);
        metadata.minPrice = priceRange[0];
        metadata.maxPrice = priceRange[1];

        return metadata;
    }

    private Query buildQuery(SearchParams params) {
        Query query = new Query();
        Criteria filters = buildCriteria(params);
        if (filters != null) {
            query.addCriteria(filters);
        }
        // Nếu không có filter nào, query trống sẽ trả về tất cả sản phẩm (đúng)
        return query;
    }

    private Criteria buildCriteria(SearchParams params) {
        List<Criteria> criteriaList = new ArrayList<>();

        if (StringUtils.hasText(params.keyword)) {
            // Trim và normalize keyword
            String normalizedKeyword = params.keyword.trim();
            if (normalizedKeyword.isEmpty()) {
                // Bỏ qua nếu keyword rỗng sau khi trim
            } else {
                // Escape các ký tự đặc biệt trong regex nhưng vẫn cho phép tìm kiếm substring
                String escapedKeyword = escapeRegexSpecialChars(normalizedKeyword);
                // Sử dụng regex với flag "i" để case-insensitive
                // Lưu ý: MongoDB regex không hỗ trợ tìm kiếm không dấu tự động
                criteriaList.add(new Criteria().orOperator(
                        Criteria.where("name").regex(escapedKeyword, "i"),
                        Criteria.where("description").regex(escapedKeyword, "i")
                ));
            }
        }

        List<String> categories = mergeValues(params.category, params.categories);
        if (!categories.isEmpty()) {
            criteriaList.add(Criteria.where("category").in(categories));
        }

        List<String> subCategories = mergeValues(params.subCategory, params.subCategories);
        if (!subCategories.isEmpty()) {
            criteriaList.add(Criteria.where("subCategory").in(subCategories));
        }

        // Chỉ filter giá nếu có giá trị hợp lệ
        // Nếu priceMin = 0 và priceMax = 0 (cả hai đều được set và = 0), không filter (hiển thị tất cả)
        if (params.priceMin != null || params.priceMax != null) {
            // Bỏ qua filter nếu cả hai đều được set và = 0 (giá trị mặc định từ Frontend)
            boolean bothZero = (params.priceMin != null && params.priceMin == 0.0) && 
                               (params.priceMax != null && params.priceMax == 0.0);
            
            if (!bothZero) {
                Criteria priceCriteria = Criteria.where("finalPrice");
                boolean hasCondition = false;
                
                if (params.priceMin != null && params.priceMin > 0) {
                    priceCriteria.gte(params.priceMin);
                    hasCondition = true;
                }
                if (params.priceMax != null && params.priceMax > 0) {
                    priceCriteria.lte(params.priceMax);
                    hasCondition = true;
                }
                
                // Chỉ thêm criteria nếu có ít nhất một điều kiện giá hợp lệ
                if (hasCondition) {
                    criteriaList.add(priceCriteria);
                }
            }
        }

        if (hasValues(params.origins)) {
            criteriaList.add(Criteria.where("origin").in(params.origins));
        }

        if (hasValues(params.certifications)) {
            criteriaList.add(Criteria.where("certifications").all(params.certifications));
        }

        if (params.ratingMin != null) {
            criteriaList.add(Criteria.where("rating").gte(params.ratingMin));
        }

        if (Boolean.TRUE.equals(params.onSaleOnly)) {
            criteriaList.add(Criteria.where("discount").gt(0));
        }

        if (Boolean.TRUE.equals(params.isSeasonal)) {
            criteriaList.add(Criteria.where("isSeasonal").is(true));
        }

        if (Boolean.TRUE.equals(params.isClearance)) {
            criteriaList.add(Criteria.where("isClearance").is(true));
        }

        if (criteriaList.isEmpty()) {
            return null;
        }
        if (criteriaList.size() == 1) {
            return criteriaList.get(0);
        }
        return new Criteria().andOperator(criteriaList.toArray(new Criteria[0]));
    }

    private Sort resolveSort(String sortBy) {
        if (!StringUtils.hasText(sortBy)) {
            return Sort.by(Sort.Direction.DESC, "soldQuantity");
        }

        switch (sortBy.toLowerCase()) {
            case "price_asc":
            case "price_low_to_high":
                return Sort.by(Sort.Direction.ASC, "finalPrice");
            case "price_desc":
            case "price_high_to_low":
                return Sort.by(Sort.Direction.DESC, "finalPrice");
            case "rating_desc":
            case "rating":
                return Sort.by(Sort.Direction.DESC, "rating");
            case "newest":
                return Sort.by(Sort.Direction.DESC, "createdAt");
            case "sold_desc":
            case "popular":
            default:
                return Sort.by(Sort.Direction.DESC, "soldQuantity");
        }
    }

    private List<String> mergeValues(String singleValue, List<String> multiValues) {
        List<String> result = new ArrayList<>();
        if (StringUtils.hasText(singleValue)) {
            result.add(singleValue);
        }
        if (multiValues != null) {
            for (String value : multiValues) {
                if (StringUtils.hasText(value) && !result.contains(value)) {
                    result.add(value);
                }
            }
        }
        return result;
    }

    private boolean hasValues(List<String> values) {
        if (values == null) {
            return false;
        }
        return values.stream().anyMatch(StringUtils::hasText);
    }

    /**
     * Escape các ký tự đặc biệt trong regex để tránh lỗi khi tìm kiếm
     * Vẫn cho phép tìm kiếm substring (không dùng Pattern.quote)
     */
    private String escapeRegexSpecialChars(String input) {
        if (input == null) {
            return null;
        }
        // Escape các ký tự đặc biệt trong regex: . * + ? ^ $ [ ] { } | ( ) \
        return input.replaceAll("([.\\[\\]{}()*+?^$|\\\\])", "\\\\$1");
    }

    private List<FilterCount> computeCounts(List<Product> products, Function<Product, String> extractor) {
        Map<String, Long> counts = products.stream()
                .map(extractor)
                .filter(StringUtils::hasText)
                .collect(Collectors.groupingBy(value -> value, Collectors.counting()));
        return toFilterCounts(counts);
    }

    private List<FilterCount> computeListCounts(List<Product> products, Function<Product, List<String>> extractor) {
        Map<String, Long> counts = products.stream()
                .map(extractor)
                .filter(values -> values != null && !values.isEmpty())
                .flatMap(List::stream)
                .filter(StringUtils::hasText)
                .collect(Collectors.groupingBy(value -> value, Collectors.counting()));
        return toFilterCounts(counts);
    }

    private List<FilterCount> toFilterCounts(Map<String, Long> counts) {
        return counts.entrySet().stream()
                .map(entry -> new FilterCount(entry.getKey(), entry.getValue()))
                .sorted((a, b) -> {
                    int compare = Long.compare(b.count, a.count);
                    if (compare != 0) {
                        return compare;
                    }
                    return a.value.compareToIgnoreCase(b.value);
                })
                .collect(Collectors.toList());
    }

    private List<FilterCount> computeRatingBuckets(SearchParams params) {
        SearchParams copy = params.copy();
        copy.ratingMin = null;
        List<Product> products = mongoTemplate.find(buildQuery(copy), Product.class);
        double[] thresholds = {5.0, 4.0, 3.0};
        List<FilterCount> buckets = new ArrayList<>();
        for (double threshold : thresholds) {
            long count = products.stream()
                    .filter(product -> product.getRating() != null && product.getRating() >= threshold)
                    .count();
            buckets.add(new FilterCount(String.valueOf(threshold), count));
        }
        return buckets;
    }

    private long computeOnSaleCount(SearchParams params) {
        SearchParams copy = params.copy();
        copy.onSaleOnly = null;
        Query query = buildQuery(copy);
        query.addCriteria(Criteria.where("discount").gt(0));
        return mongoTemplate.count(query, Product.class);
    }

    private long computeSeasonalCount(SearchParams params) {
        SearchParams copy = params.copy();
        copy.isSeasonal = null;
        Query query = buildQuery(copy);
        query.addCriteria(Criteria.where("isSeasonal").is(true));
        return mongoTemplate.count(query, Product.class);
    }

    private long computeClearanceCount(SearchParams params) {
        SearchParams copy = params.copy();
        copy.isClearance = null;
        Query query = buildQuery(copy);
        query.addCriteria(Criteria.where("isClearance").is(true));
        return mongoTemplate.count(query, Product.class);
    }

    private double[] computePriceRange(SearchParams params) {
        SearchParams copy = params.copy();
        copy.priceMin = null;
        copy.priceMax = null;
        List<Product> products = mongoTemplate.find(buildQuery(copy), Product.class);
        double min = products.stream()
                .map(Product::getFinalPrice)
                .filter(value -> value != null && !value.isNaN())
                .min(Double::compareTo)
                .orElse(0.0);

        double max = products.stream()
                .map(Product::getFinalPrice)
                .filter(value -> value != null && !value.isNaN())
                .max(Double::compareTo)
                .orElse(min);

        return new double[]{min, max};
    }

    public static class FilterCount {
        public String value;
        public long count;

        public FilterCount() {}

        public FilterCount(String value, long count) {
            this.value = value;
            this.count = count;
        }
    }

    public static class FilterMetadata {
        public List<FilterCount> categories = List.of();
        public List<FilterCount> subCategories = List.of();
        public List<FilterCount> origins = List.of();
        public List<FilterCount> certifications = List.of();
        public List<FilterCount> ratings = List.of();
        public long onSaleCount;
        public long seasonalCount;
        public long clearanceCount;
        public Double minPrice;
        public Double maxPrice;
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