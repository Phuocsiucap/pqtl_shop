package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserVoucherResponse {
    private String id;
    private String userId;
    private VoucherResponse voucher;             // Thông tin voucher đầy đủ
    private Boolean isUsed;
    private LocalDateTime usedAt;
    private String orderId;
    private Integer pointsSpent;
    private LocalDateTime redeemedAt;
    private LocalDateTime expiresAt;
}
