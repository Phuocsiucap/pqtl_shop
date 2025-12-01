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
    private double total;  // (price - discount) * qty or clearance price * qty
    
    // Thanh lý
    private Boolean isClearance = false;
    private Double clearanceDiscount = 0.0;
    
    /**
     * Tính giá cuối cùng của sản phẩm (ưu tiên: thanh lý > giảm giá > giá gốc)
     */
    public double getFinalPrice() {
        if (isClearance != null && isClearance && clearanceDiscount != null && clearanceDiscount > 0) {
            return price * (1 - clearanceDiscount / 100);
        }
        return price - discount;
    }
    
    /**
     * Tính tổng tiền
     */
    public double calculateTotal() {
        return getFinalPrice() * qty;
    }
}