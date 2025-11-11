package org.example.config;

import org.example.model.Product;
import org.example.model.ProductReview;
import org.example.model.SearchHistory;
import org.example.repository.ProductRepository;
import org.example.repository.ProductReviewRepository;
import org.example.repository.SearchHistoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(
            ProductRepository productRepository,
            ProductReviewRepository reviewRepository,
            SearchHistoryRepository searchHistoryRepository) {
        return args -> {
            // Xóa dữ liệu cũ để đảm bảo sạch sẽ
            productRepository.deleteAll();
            reviewRepository.deleteAll();
            searchHistoryRepository.deleteAll();

            // 1. Tạo dữ liệu Sản phẩm (Hoa quả)
            // createProduct(name, description, category, image, price, discount, stock, sold, rating, reviewCount, isBestSeller, isSeasonal)
            Product apple = createProduct("Táo Envy New Zealand", "Táo giòn, ngọt, nhập khẩu trực tiếp từ New Zealand", "Táo", "url_apple.jpg", 150000, 0, 50, 120, 4.9, 5, true, false); // Bestseller
            Product orange = createProduct("Cam Sành Bến Tre", "Cam tươi, mọng nước, vị ngọt thanh tự nhiên", "Cam", "url_orange.jpg", 45000, 5000, 100, 80, 4.2, 3, true, true); // Bestseller & Seasonal
            Product mango = createProduct("Xoài Cát Chu", "Xoài chín vàng, thơm lừng, thích hợp làm sinh tố", "Xoài", "url_mango.jpg", 75000, 0, 30, 10, 4.0, 1, false, true); // Seasonal
            Product grape = createProduct("Nho Xanh Ninh Thuận", "Nho tươi, không hạt, vị chua ngọt cân bằng", "Nho", "url_grape.jpg", 90000, 10000, 70, 50, 4.7, 4, true, false); // Bestseller
            Product avocado = createProduct("Bơ Sáp Đắk Lắk", "Bơ dẻo, béo ngậy, chất lượng cao", "Bơ", "url_avocado.jpg", 60000, 0, 40, 20, 0.0, 0, false, false);
            Product dragonFruit = createProduct("Thanh Long Ruột Đỏ", "Thanh long ruột đỏ ngọt mát, giàu vitamin", "Trái Cây Tươi", "url_dragon.jpg", 35000, 0, 60, 40, 4.6, 2, true, false); // Bestseller
            Product lettuce = createProduct("Rau Xà Lách Hữu Cơ", "Rau ăn lá tươi sạch, trồng theo phương pháp hữu cơ", "Rau Ăn Lá Hữu Cơ", "url_lettuce.jpg", 25000, 0, 80, 15, 4.1, 1, false, false);
            Product ginger = createProduct("Gừng Tươi", "Gia vị thiết yếu, gừng tươi cay nồng", "Củ Quả & Gia Vị", "url_ginger.jpg", 15000, 0, 90, 5, 0.0, 0, false, false);


            List<Product> savedProducts = productRepository.saveAll(List.of(apple, orange, mango, grape, avocado, dragonFruit, lettuce, ginger));

            // Lấy ID của sản phẩm đầu tiên để tạo đánh giá
            String productId1 = savedProducts.get(0).getId(); // Táo
            String productId2 = savedProducts.get(1).getId(); // Cam

            // 2. Tạo dữ liệu Đánh giá
            ProductReview review1 = createReview(productId1, "userA", "Khách hàng A", 5, "Táo rất ngon, giòn và ngọt đúng như mô tả!");
            ProductReview review2 = createReview(productId1, "userB", "Khách hàng B", 4, "Giá hơi cao nhưng chất lượng xứng đáng.");
            ProductReview review3 = createReview(productId2, "userC", "Khách hàng C", 4, "Cam tươi, mọng nước, giao hàng nhanh.");

            reviewRepository.saveAll(List.of(review1, review2, review3));

            // 3. Cập nhật lại thống kê Product sau khi có Reviews (vì logic này nằm trong Service, ta phải làm thủ công ở đây)
            apple.setReviewCount(2);
            apple.setRating(4.5); // (5+4)/2 = 4.5
            orange.setReviewCount(1);
            orange.setRating(4.0);
            productRepository.saveAll(List.of(apple, orange));


            // 4. Tạo dữ liệu Lịch sử tìm kiếm
            SearchHistory history1 = createSearchHistory("user123", "Táo Envy", LocalDateTime.now().minusHours(1));
            SearchHistory history2 = createSearchHistory("user123", "Cam Sành", LocalDateTime.now().minusMinutes(30));
            SearchHistory history3 = createSearchHistory("user456", "Nho Xanh", LocalDateTime.now().minusMinutes(10));

            searchHistoryRepository.saveAll(List.of(history1, history2, history3));

            System.out.println("--- MongoDB Data Seeding Complete ---");
        };
    }

    private Product createProduct(String name, String description, String category, String image, double price, double discount, int stock, int sold, Double rating, Integer reviewCount, Boolean isBestSeller, Boolean isSeasonal) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(description);
        p.setCategory(category);
        p.setImage(image);
        p.setPrice(price);
        p.setDiscount(discount);
        p.setStockQuantity(stock);
        p.setSoldQuantity(sold);
        p.setRating(rating);
        p.setReviewCount(reviewCount);
        p.setIsBestSeller(isBestSeller);
        p.setIsSeasonal(isSeasonal);
        return p;
    }

    private ProductReview createReview(String productId, String userId, String username, int rating, String comment) {
        ProductReview r = new ProductReview();
        r.setProductId(productId);
        r.setUserId(userId);
        r.setUsername(username);
        r.setRating(rating);
        r.setComment(comment);
        return r;
    }

    private SearchHistory createSearchHistory(String userId, String keyword, LocalDateTime date) {
        SearchHistory h = new SearchHistory();
        h.setUserId(userId);
        h.setKeyword(keyword);
        h.setSearchDate(date);
        return h;
    }
}