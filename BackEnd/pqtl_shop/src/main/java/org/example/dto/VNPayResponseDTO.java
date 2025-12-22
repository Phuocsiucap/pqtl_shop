package org.example.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VNPayResponseDTO {
    private String code;           // Mã kết quả: "00" thành công
    private String message;        // Thông báo
    private String payment_url;    // URL thanh toán VNPAY
    private String order_id;       // Mã đơn hàng
    private long amount;           // Số tiền
    private String order_desc;     // Mô tả
    private String transaction_no; // Mã giao dịch VNPAY
    private String bank_code;      // Mã ngân hàng
    private String pay_date;       // Thời gian thanh toán
    private String card_type;      // Loại thẻ
    private String response_code;  // Mã phản hồi VNPAY
}
