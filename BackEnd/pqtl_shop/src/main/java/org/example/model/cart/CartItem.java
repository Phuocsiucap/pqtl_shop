// FILE: org/example/model/CartItem.java
package org.example.model.cart;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    private String productId;
    private String productName;
    private String image;
    private double price;
    private double discount;
    private int qty;
    private double total;  // (price - discount) * qty
}