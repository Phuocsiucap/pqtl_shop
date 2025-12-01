package org.example.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "user_vouchers")
public class UserVoucher {
    @Id
    private String id;
    
    @Field("user_id")
    private String userId;                       // ID của user
    
    @Field("voucher_id")
    private String voucherId;                    // ID của voucher
    
    @Field("is_used")
    private Boolean isUsed = false;              // Đã sử dụng chưa
    
    @Field("used_at")
    private LocalDateTime usedAt;                // Thời gian sử dụng
    
    @Field("order_id")
    private String orderId;                      // ID đơn hàng đã dùng voucher (nếu đã sử dụng)
    
    @Field("points_spent")
    private Integer pointsSpent;                 // Số điểm đã dùng để đổi
    
    @CreatedDate
    @Field("redeemed_at")
    private LocalDateTime redeemedAt;            // Thời gian đổi voucher
    
    @Field("expires_at")
    private LocalDateTime expiresAt;             // Thời hạn sử dụng voucher (có thể khác end_date của voucher gốc)
}
