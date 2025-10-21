        package org.example.service;

        import org.example.model.Product;
        import org.example.repository.ProductRepository;
        import lombok.RequiredArgsConstructor;
        import org.springframework.stereotype.Service;

        import java.util.List;
        @Service
        @RequiredArgsConstructor // Tạo constructor cho final fields
        public class SearchProductService {

            private final ProductRepository productRepository;

            // Tìm kiếm sản phẩm theo từ khóa
            public List<Product> searchProducts(String keyword) {
                return productRepository.findByNameContainingIgnoreCase(keyword);
            }

            // Tìm kiếm theo danh mục
            public List<Product> searchProductsByCategory(String keyword, String categoryId) {
                return productRepository.findByCategoryIdAndNameContainingIgnoreCase(categoryId, keyword);
            }
        }