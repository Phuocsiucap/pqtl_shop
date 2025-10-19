package org.example.model;

import lombok.Data;

@Data
public class OrderItem {
    private String productId;     // ID sản phẩm
    private String productName;   // Tên sản phẩm
    private String image;         // Ảnh sản phẩm
    private double price;         // Giá gốc
    private double discount;      // Giảm giá cho sản phẩm
    private int quantity;         // Số lượng đặt
    private double total;         // Tổng tiền cho item = (price - discount) * quantity
}
