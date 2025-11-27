package org.example.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherCreateRequest {
    private String title;                        // Tên voucher
    private String code;                         // Mã voucher
    private String description;                  // Mô tả
    private String discountType;                 // "PERCENTAGE" hoặc "FIXED_AMOUNT"
    private Double discountValue;                // Giá trị giảm
    private Double maxDiscountAmount;            // Giảm tối đa
    private Double minOrderValue;                // Đơn hàng tối thiểu
    private Integer pointsRequired;              // Điểm cần để đổi
    private Integer usageLimit;                  // Số lần sử dụng tối đa
    private LocalDateTime startDate;             // Ngày bắt đầu
    private LocalDateTime endDate;               // Ngày kết thúc
    private Boolean isActive = true;             // Trạng thái
    private String applicableCategories;         // Danh mục áp dụng
}
