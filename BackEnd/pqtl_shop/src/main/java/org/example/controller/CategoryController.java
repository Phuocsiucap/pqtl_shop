package org.example.controller;

import org.example.model.Category;
import org.example.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.Normalizer;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/v1/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * Get all categories
     * GET /api/v1/categories/
     */
    @GetMapping("/")
    public ResponseEntity<List<Category>> getAllCategories() {
        try {
            List<Category> categories = categoryRepository.findAll();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Get category by ID
     * GET /api/v1/categories/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable String id) {
        try {
            return categoryRepository.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Get category by slug
     * GET /api/v1/categories/slug/{slug}
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<Category> getCategoryBySlug(@PathVariable String slug) {
        try {
            return categoryRepository.findBySlug(slug)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * Create new category
     * POST /api/v1/categories/
     */
    @PostMapping("/")
    public ResponseEntity<?> createCategory(@RequestBody Map<String, String> categoryData) {
        try {
            String name = categoryData.get("name");
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Tên danh mục không được để trống"));
            }

            // Generate slug from name
            String slug = generateSlug(name);

            // Check if slug already exists
            if (categoryRepository.findBySlug(slug).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Danh mục với tên tương tự đã tồn tại"));
            }

            Category category = new Category();
            category.setName(name.trim());
            category.setSlug(slug);

            Category savedCategory = categoryRepository.save(category);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedCategory);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi khi tạo danh mục: " + e.getMessage()));
        }
    }

    /**
     * Update category
     * PUT /api/v1/categories/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable String id, @RequestBody Map<String, String> categoryData) {
        try {
            Category existingCategory = categoryRepository.findById(id).orElse(null);
            if (existingCategory == null) {
                return ResponseEntity.notFound().build();
            }

            String name = categoryData.get("name");
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Tên danh mục không được để trống"));
            }

            // Generate new slug
            String newSlug = generateSlug(name);

            // Check if new slug conflicts with another category
            categoryRepository.findBySlug(newSlug).ifPresent(cat -> {
                if (!cat.getId().equals(id)) {
                    throw new RuntimeException("Danh mục với tên tương tự đã tồn tại");
                }
            });

            existingCategory.setName(name.trim());
            existingCategory.setSlug(newSlug);

            Category updatedCategory = categoryRepository.save(existingCategory);
            return ResponseEntity.ok(updatedCategory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi khi cập nhật danh mục: " + e.getMessage()));
        }
    }

    /**
     * Delete category
     * DELETE /api/v1/categories/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable String id) {
        try {
            if (!categoryRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            categoryRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Xóa danh mục thành công"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Lỗi khi xóa danh mục: " + e.getMessage()));
        }
    }

    /**
     * Generate slug from Vietnamese text
     */
    private String generateSlug(String input) {
        if (input == null) return "";

        // Normalize and remove diacritics
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String withoutDiacritics = pattern.matcher(normalized).replaceAll("");

        // Convert to lowercase and replace spaces with hyphens
        String slug = withoutDiacritics.toLowerCase()
                .replaceAll("đ", "d")
                .replaceAll("Đ", "d")
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");

        return slug;
    }
}

