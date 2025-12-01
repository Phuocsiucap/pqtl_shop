package org.example.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherApplyResponse {
    private Boolean success;
    private String message;
    private Double discountAmount;               // Số tiền được giảm
    private Double finalAmount;                  // Số tiền sau giảm
    private VoucherResponse voucher;             // Thông tin voucher
}
