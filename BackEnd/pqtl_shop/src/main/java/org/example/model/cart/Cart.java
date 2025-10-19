// FILE: org/example/model/Cart.java
package org.example.model.cart;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.model.cart.CartItem;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "carts")
public class Cart {
    @Id
    private String id;

    private String userId;
    private List<CartItem> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public void updateTotal() {
        if (items != null) {
            items.forEach(item -> item.setTotal((item.getPrice() - item.getDiscount()) * item.getQty()));
        }
    }
}