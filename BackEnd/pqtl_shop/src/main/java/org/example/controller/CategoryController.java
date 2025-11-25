package org.example.controller;

import org.example.model.Category;
import org.example.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}

