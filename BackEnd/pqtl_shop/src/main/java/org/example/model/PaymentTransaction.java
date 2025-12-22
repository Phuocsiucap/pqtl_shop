package org.example.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "payment_transactions")
public class PaymentTransaction {
    @Id
    private String id;
    
    private String orderId;           // Mã đơn hàng trong hệ thống
    private String vnpTxnRef;         // Mã giao dịch VNPAY (vnp_TxnRef)
    private String vnpTransactionNo;  // Số giao dịch VNPAY (vnp_TransactionNo)
    private long amount;              // Số tiền (VNĐ)
    private String orderInfo;         // Thông tin đơn hàng
    private String bankCode;          // Mã ngân hàng
    private String cardType;          // Loại thẻ
    private String payDate;           // Thời gian thanh toán (yyyyMMddHHmmss)
    private String responseCode;      // Mã phản hồi VNPAY
    private String transactionStatus; // Trạng thái: PENDING, SUCCESS, FAILED, REFUNDED
    private String userId;            // ID người dùng
    
    private LocalDateTime createdAt;  // Thời gian tạo
    private LocalDateTime updatedAt;  // Thời gian cập nhật
    
    // Thông tin hoàn tiền (nếu có)
    private boolean refunded;
    private LocalDateTime refundedAt;
    private String refundReason;
    private long refundAmount;
}
