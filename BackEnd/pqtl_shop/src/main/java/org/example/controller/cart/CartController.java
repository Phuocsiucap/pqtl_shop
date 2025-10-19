package org.example.controller.cart;

import org.example.model.cart.Cart;
import org.example.model.cart.CartItem;
import org.example.model.login.User;
import org.example.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {
    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<?> getCart(Authentication authentication) {
        try {
            String userId = extractUserIdFromAuthentication(authentication);
            Cart cart = cartService.getCartByUserId(userId);
            return ResponseEntity.ok(cart.getItems());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> addItemToCart(
            Authentication authentication,
            @RequestBody CartItem cartItem) {
        try {
            String userId = extractUserIdFromAuthentication(authentication);
            Cart updatedCart = cartService.addItemToCart(userId, cartItem);
            return ResponseEntity.ok(updatedCart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{productId}")
    public ResponseEntity<?> updateItemQuantity(
            Authentication authentication,
            @PathVariable String productId,
            @RequestBody Map<String, Integer> payload) {
        try {
            String userId = extractUserIdFromAuthentication(authentication);
            int qty = payload.getOrDefault("qty", 1);
            Cart updatedCart = cartService.updateItemQuantity(userId, productId, qty);
            return ResponseEntity.ok(updatedCart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeItemFromCart(
            Authentication authentication,
            @PathVariable String productId) {
        try {
            String userId = extractUserIdFromAuthentication(authentication);
            Cart updatedCart = cartService.removeItemFromCart(userId, productId);
            return ResponseEntity.ok(updatedCart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> clearCart(Authentication authentication) {
        try {
            String userId = extractUserIdFromAuthentication(authentication);
            Cart clearedCart = cartService.clearCart(userId);
            return ResponseEntity.ok(clearedCart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/bulk-delete")
    public ResponseEntity<?> bulkDeleteItems(
            Authentication authentication,
            @RequestBody Map<String, List<String>> payload) {
        try {
            String userId = extractUserIdFromAuthentication(authentication);
            List<String> productIds = payload.get("ids");
            Cart updatedCart = cartService.bulkDeleteItems(userId, productIds);
            return ResponseEntity.ok(updatedCart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/subtotal")
    public ResponseEntity<?> getSubtotal(Authentication authentication) {
        try {
            String userId = extractUserIdFromAuthentication(authentication);
            double subtotal = cartService.getCartSubtotal(userId);
            return ResponseEntity.ok(Map.of("subtotal", subtotal));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/count")
    public ResponseEntity<?> getItemCount(Authentication authentication) {
        try {
            String userId = extractUserIdFromAuthentication(authentication);
            int count = cartService.getCartItemCount(userId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private String extractUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }
}