package org.example.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherApplyRequest {
    private String voucherCode;                  // Mã voucher hoặc user_voucher_id
    private Double orderTotal;                   // Tổng đơn hàng
}
