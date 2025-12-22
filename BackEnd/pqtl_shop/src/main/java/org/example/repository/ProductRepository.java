package org.example.repository;

import org.example.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {

    // US1.1, US1.3, US1.4: Tìm kiếm theo tên/mô tả và lọc theo danh mục (Category)
    // Lưu ý: Spring Data MongoDB không hỗ trợ kết hợp $or và $and phức tạp qua method name
    // một cách dễ dàng. Tôi sẽ sử dụng MongoTemplate trong Service cho logic phức tạp hơn
    // (như lọc giá, sắp xếp). Hàm này chỉ dùng cho tìm kiếm cơ bản theo keyword và category.
    Page<Product> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCaseAndCategory(
            String name, String description, String category, Pageable pageable);

    // US1.6: Full-Text Search (Cần index text trong MongoDB)
    // Sử dụng @Query để tận dụng $text search index
    @Query(value = "{ '$text' : { '$search' : ?0 } }", fields = "{ 'score' : { '$meta' : 'textScore' } }")
    Page<Product> findByFullTextSearch(String text, Pageable pageable);

    // US2.4: Tìm sản phẩm tương tự (theo Category)
    List<Product> findTop4ByCategoryAndIdNot(String category, String currentProductId);

    // Homepage: Lấy 8 sản phẩm được đánh dấu là Bestseller
    List<Product> findTop8ByIsBestSellerTrue();

    // Homepage: Lấy 8 sản phẩm sắp xếp theo số lượng bán (SoldQuantity)
    List<Product> findTop8ByOrderBySoldQuantityDesc();

    // Homepage: Lấy sản phẩm theo mùa (Seasonal)
    List<Product> findTop6ByIsSeasonalTrue();

    // Homepage: Lấy 8 sản phẩm mới nhất (theo thời gian tạo)
    List<Product> findTop8ByOrderByCreatedAtDesc();

    // Homepage: Lấy 8 sản phẩm mới nhất (theo ID giảm dần - fallback nếu không có createdAt)
    List<Product> findTop8ByOrderByIdDesc();

    List<Product> findByIsClearanceTrue();
}