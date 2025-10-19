package org.example.service;

import org.example.model.cart.Cart;
import org.example.model.cart.CartItem;
import org.example.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {
    @Autowired
    private CartRepository cartRepository;

    public Cart getCartByUserId(String userId) {
        Optional<Cart> cart = cartRepository.findByUserId(userId);
        if (cart.isEmpty()) {
            Cart newCart = new Cart();
            newCart.setUserId(userId);
            newCart.setItems(new ArrayList<>());
            newCart.setCreatedAt(LocalDateTime.now());
            newCart.setUpdatedAt(LocalDateTime.now());
            return cartRepository.save(newCart);
        }
        return cart.get();
    }

    public Cart addItemToCart(String userId, CartItem cartItem) {
        Cart cart = getCartByUserId(userId);

        if (cart.getItems() == null) {
            cart.setItems(new ArrayList<>());
        }

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(cartItem.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQty(item.getQty() + cartItem.getQty());
            item.setTotal((item.getPrice() - item.getDiscount()) * item.getQty());
        } else {
            cartItem.setTotal((cartItem.getPrice() - cartItem.getDiscount()) * cartItem.getQty());
            cart.getItems().add(cartItem);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public Cart updateItemQuantity(String userId, String productId, int qty) {
        Cart cart = getCartByUserId(userId);

        cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .ifPresent(item -> {
                    item.setQty(qty);
                    item.setTotal((item.getPrice() - item.getDiscount()) * qty);
                });

        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public Cart removeItemFromCart(String userId, String productId) {
        Cart cart = getCartByUserId(userId);
        cart.getItems().removeIf(item -> item.getProductId().equals(productId));
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public Cart clearCart(String userId) {
        Cart cart = getCartByUserId(userId);
        cart.setItems(new ArrayList<>());
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public Cart bulkDeleteItems(String userId, List<String> productIds) {
        Cart cart = getCartByUserId(userId);
        cart.getItems().removeIf(item -> productIds.contains(item.getProductId()));
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public double getCartSubtotal(String userId) {
        Cart cart = getCartByUserId(userId);
        return cart.getItems().stream()
                .mapToDouble(CartItem::getTotal)
                .sum();
    }

    public int getCartItemCount(String userId) {
        Cart cart = getCartByUserId(userId);
        return cart.getItems().stream()
                .mapToInt(CartItem::getQty)
                .sum();
    }
}
