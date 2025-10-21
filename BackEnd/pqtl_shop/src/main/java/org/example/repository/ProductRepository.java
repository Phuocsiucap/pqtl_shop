package org.example.repository;

import org.example.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {
    // Tìm kiếm theo tên (không phân biệt hoa thường)
    List<Product> findByNameContainingIgnoreCase(String keyword);

    // Tìm kiếm theo danh mục và từ khóa
    List<Product> findByCategoryIdAndNameContainingIgnoreCase(String categoryId, String keyword);
}