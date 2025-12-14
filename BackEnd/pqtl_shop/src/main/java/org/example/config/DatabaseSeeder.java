package org.example.config;

import org.example.model.Category;
import org.example.model.Product;
import org.example.repository.CategoryRepository;
import org.example.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

/**
 * Database Seeder để thêm 6 categories và sản phẩm mẫu vào MongoDB
 * Chạy tự động khi ứng dụng khởi động (chỉ thêm nếu chưa tồn tại)
 */
@Component
@Profile("dev")
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        seedCategories();
        seedProducts();
    }

    private void seedCategories() {
        List<Category> defaultCategories = Arrays.asList(
            new Category(null, "Trái Cây Tươi", "trai-cay-tuoi"),
            new Category(null, "Rau Ăn Hữu Cơ", "rau-an-huu-co"),
            new Category(null, "Củ Quả & Gia Vị", "cu-qua-gia-vi"),
            new Category(null, "Thịt & Trứng Sạch", "thit-trung-sach"),
            new Category(null, "Hải Sản Tươi", "hai-san-tuoi"),
            new Category(null, "Thực Phẩm Khô", "thuc-pham-kho")
        );

        for (Category category : defaultCategories) {
            // Kiểm tra xem category đã tồn tại chưa (theo slug)
            if (!categoryRepository.findBySlug(category.getSlug()).isPresent()) {
                categoryRepository.save(category);
                System.out.println("Đã thêm category: " + category.getName());
            } else {
                System.out.println("Category đã tồn tại: " + category.getName());
            }
        }
    }

    private void seedProducts() {
        // Kiểm tra xem đã có sản phẩm chưa
        if (productRepository.count() > 0) {
            System.out.println("Đã có sản phẩm trong database, bỏ qua seed products.");
            return;
        }

        List<Product> sampleProducts = Arrays.asList(
            // ========== TRÁI CÂY TƯƠI ==========
            createProduct("Cam Sành Đà Lạt", "Cam sành tươi ngon, giàu vitamin C, xuất xứ Đà Lạt",
                "Trái Cây Tươi", "Trái cây nội địa", 45000, 5000, 100, "Nông Sản Đà Lạt", "Đà Lạt",
                List.of("VietGAP"), "Cam sành Đà Lạt, trọng lượng 1kg, bảo quản nơi khô ráo, thoáng mát", true, false, 4.7),

            createProduct("Dâu Tây Đà Lạt", "Dâu tây tươi ngon, ngọt thanh, đóng hộp 500g",
                "Trái Cây Tươi", "Trái cây đặc sản", 120000, 10000, 50, "Nông Trại Hills", "Đà Lạt",
                List.of("VietGAP", "Organic"), "Dâu tây Đà Lạt hạng A, 500g/hộp, bảo quản lạnh 2-4°C", true, true, 4.9),

            createProduct("Nho Mẫu Đơn", "Nho mẫu đơn tươi, giòn ngọt, 1kg",
                "Trái Cây Tươi", "Trái cây nhập khẩu", 85000, 0, 80, "Sunny Farm", "Ninh Thuận",
                List.of("GlobalGAP"), "Nho mẫu đơn Ninh Thuận, 1kg, rửa sạch trước khi ăn", false, false, 4.4),

            createProduct("Xoài Cát Hòa Lộc", "Xoài cát Hòa Lộc chín cây, thơm ngọt, 1kg",
                "Trái Cây Tươi", "Trái cây nội địa", 55000, 5000, 60, "CoFarm", "Tiền Giang",
                List.of("VietGAP"), "Xoài cát Hòa Lộc Tiền Giang, 1kg, chín tự nhiên", false, true, 4.6),

            // ========== RAU ĂN HỮU CƠ ==========
            createProduct("Rau Muống Hữu Cơ", "Rau muống hữu cơ tươi xanh, không thuốc trừ sâu, 500g",
                "Rau Ăn Hữu Cơ", "Rau ăn lá", 25000, 0, 150, "Hữu Cơ Việt", "Hưng Yên",
                List.of("VietGAP", "Organic"), "Rau muống hữu cơ, 500g, chứng nhận VietGAP, rửa sạch trước khi dùng", true, false, 4.5),

            createProduct("Cải Bó Xôi Hữu Cơ", "Cải bó xôi hữu cơ giàu sắt, 300g",
                "Rau Ăn Hữu Cơ", "Rau ăn lá", 35000, 3000, 100, "GreenLeaf", "Đà Lạt",
                List.of("Organic"), "Cải bó xôi hữu cơ, 300g, giàu vitamin và khoáng chất", false, false, 4.3),

            createProduct("Rau Cải Ngọt Hữu Cơ", "Rau cải ngọt hữu cơ tươi xanh, 500g",
                "Rau Ăn Hữu Cơ", "Rau thân mềm", 28000, 0, 120, "Nông Trại Xanh", "Bảo Lộc",
                List.of("VietGAP"), "Rau cải ngọt hữu cơ, 500g, trồng theo tiêu chuẩn hữu cơ", false, false, 4.2),

            createProduct("Xà Lách Romaine Hữu Cơ", "Xà lách Romaine hữu cơ giòn ngon, 300g",
                "Rau Ăn Hữu Cơ", "Rau ăn lá", 40000, 5000, 80, "Hữu Cơ Việt", "Đà Lạt",
                List.of("VietGAP"), "Xà lách Romaine hữu cơ, 300g, tươi giòn, giàu chất xơ", false, false, 4.4),

            // ========== CỦ QUẢ & GIA VỊ ==========
            createProduct("Tỏi Lý Sơn", "Tỏi Lý Sơn thơm cay, 500g",
                "Củ Quả & Gia Vị", "Gia vị khô", 45000, 0, 200, "Hải Nông", "Quảng Ngãi",
                List.of("OCOP"), "Tỏi Lý Sơn, 500g, thơm cay đặc trưng, bảo quản nơi khô ráo", true, false, 4.8),

            createProduct("Hành Tím", "Hành tím tươi, 1kg",
                "Củ Quả & Gia Vị", "Củ gia vị", 30000, 0, 180, "Highland Agro", "Đà Lạt",
                List.of("VietGAP"), "Hành tím Đà Lạt, 1kg, tươi ngon, bảo quản nơi khô ráo", false, false, 4.1),

            createProduct("Gừng Tươi", "Gừng tươi già, 500g",
                "Củ Quả & Gia Vị", "Củ gia vị", 35000, 0, 150, "Sunshine Farm", "Đà Lạt",
                List.of("VietGAP"), "Gừng tươi Đà Lạt, 500g, già, thơm nồng", false, false, 4.0),

            createProduct("Ớt Hiểm", "Ớt hiểm cay nồng, 200g",
                "Củ Quả & Gia Vị", "Gia vị tươi", 25000, 0, 100, "Highland Agro", "Đà Lạt",
                List.of("VietGAP"), "Ớt hiểm Đà Lạt, 200g, cay nồng, dùng làm gia vị", false, false, 4.2),

            // ========== THỊT & TRỨNG SẠCH ==========
            createProduct("Thịt Heo Ba Chỉ Sạch", "Thịt heo ba chỉ sạch, tươi ngon, 500g",
                "Thịt & Trứng Sạch", "Thịt heo", 120000, 10000, 50, "EcoFarm", "Đồng Nai",
                List.of("HACCP"), "Thịt heo ba chỉ sạch, 500g, không chất bảo quản, bảo quản lạnh", true, false, 4.6),

            createProduct("Thịt Bò Thăn", "Thịt bò thăn tươi, 500g",
                "Thịt & Trứng Sạch", "Thịt bò", 250000, 20000, 30, "EcoFarm", "Lâm Đồng",
                List.of("GlobalGAP"), "Thịt bò thăn, 500g, tươi ngon, bảo quản lạnh 0-4°C", false, false, 4.5),

            createProduct("Trứng Gà Ta", "Trứng gà ta sạch, 10 quả",
                "Thịt & Trứng Sạch", "Gia cầm & Trứng", 45000, 0, 200, "Trang Trại An Tâm", "Bình Phước",
                List.of("VietGAP"), "Trứng gà ta sạch, 10 quả, gà nuôi thả vườn", true, false, 4.7),

            createProduct("Thịt Gà Ta", "Thịt gà ta nguyên con, 1.2-1.5kg",
                "Thịt & Trứng Sạch", "Gia cầm & Trứng", 180000, 15000, 25, "Trang Trại An Tâm", "Bình Phước",
                List.of("HACCP"), "Thịt gà ta nguyên con, 1.2-1.5kg, gà nuôi thả vườn", false, false, 4.3),

            // ========== HẢI SẢN TƯƠI ==========
            createProduct("Tôm Sú Tươi", "Tôm sú tươi sống, 1kg",
                "Hải Sản Tươi", "Hải sản nước mặn", 280000, 20000, 40, "Biển Xanh", "Cần Thơ",
                List.of("ASC"), "Tôm sú tươi sống, 1kg, size 20-25 con/kg, bảo quản lạnh", true, false, 4.8),

            createProduct("Cá Basa Fillet", "Cá basa fillet tươi, 500g",
                "Hải Sản Tươi", "Hải sản nước ngọt", 85000, 5000, 60, "Biển Xanh", "An Giang",
                List.of("ASC"), "Cá basa fillet tươi, 500g, đã làm sạch, bảo quản lạnh", false, false, 4.4),

            createProduct("Mực Tươi", "Mực tươi nguyên con, 500g",
                "Hải Sản Tươi", "Hải sản nước mặn", 120000, 10000, 35, "Biển Xanh", "Khánh Hòa",
                List.of("ASC"), "Mực tươi nguyên con, 500g, tươi ngon, bảo quản lạnh", false, false, 4.5),

            createProduct("Cua Biển", "Cua biển tươi sống, 1kg (2-3 con)",
                "Hải Sản Tươi", "Hải sản nước mặn", 350000, 30000, 20, "Biển Xanh", "Cà Mau",
                List.of("ASC"), "Cua biển tươi sống, 1kg (2-3 con), cua chắc thịt", true, false, 4.9),

            // ========== THỰC PHẨM KHÔ ==========
            createProduct("Gạo ST25", "Gạo ST25 thơm ngon, 5kg",
                "Thực Phẩm Khô", "Gạo & Ngũ cốc", 180000, 15000, 100, "Hạt Ngọc", "Sóc Trăng",
                List.of("HACCP"), "Gạo ST25 An Giang, 5kg, gạo thơm ngon, bảo quản nơi khô ráo", true, false, 4.9),

            createProduct("Đậu Xanh Cà Mau", "Đậu xanh Cà Mau, 1kg",
                "Thực Phẩm Khô", "Đậu & Hạt", 45000, 0, 150, "Hạt Ngọc", "Cà Mau",
                List.of("OCOP"), "Đậu xanh Cà Mau, 1kg, hạt to đều, bảo quản nơi khô ráo", false, false, 4.2),

            createProduct("Mè Đen", "Mè đen rang sẵn, 500g",
                "Thực Phẩm Khô", "Đậu & Hạt", 55000, 5000, 120, "Hạt Ngọc", "An Giang",
                List.of("OCOP"), "Mè đen rang sẵn, 500g, thơm béo, bảo quản kín", false, false, 4.0),

            createProduct("Nấm Hương Khô", "Nấm hương khô, 200g",
                "Thực Phẩm Khô", "Gia vị khô", 85000, 0, 80, "Hạt Ngọc", "Đà Lạt",
                List.of("VietGAP"), "Nấm hương khô Đà Lạt, 200g, ngâm nước trước khi dùng", false, false, 4.3)
        );

        for (Product product : sampleProducts) {
            productRepository.save(product);
            System.out.println("Đã thêm sản phẩm: " + product.getName() + " - " + product.getCategory());
        }

        System.out.println("Đã thêm tổng cộng " + sampleProducts.size() + " sản phẩm mẫu.");
    }

    private Product createProduct(String name, String description, String category, String subCategory,
                                  double price, double discount, int stockQuantity,
                                  String brand, String origin, List<String> certifications,
                                  String specifications,
                                  boolean isBestSeller, boolean isSeasonal, double rating) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setCategory(category);
        product.setSubCategory(subCategory);
        product.setPrice(price);
        product.setDiscount(discount);
        product.setFinalPrice(price - discount);
        product.setStockQuantity(stockQuantity);
        product.setSoldQuantity(0);
        product.setBrand(brand);
        product.setOrigin(origin);
        product.setCertifications(certifications);
        product.setIsBestSeller(isBestSeller);
        product.setIsSeasonal(isSeasonal);
        product.setRating(rating);
        product.setReviewCount(0);
        product.setImage(""); // Có thể thêm đường dẫn ảnh sau
        product.setCreatedAt(Instant.now());
        return product;
    }
}

