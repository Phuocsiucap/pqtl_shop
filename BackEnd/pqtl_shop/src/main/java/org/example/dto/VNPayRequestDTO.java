package org.example.dto;

import lombok.Data;

@Data
public class VNPayRequestDTO {
    private String order_id;      // Mã đơn hàng
    private long amount;          // Số tiền thanh toán (VNĐ)
    private String order_desc;    // Mô tả đơn hàng
    private String bank_code;     // Mã ngân hàng (optional)
    private String language;      // Ngôn ngữ: "vn" hoặc "en"
}
