package org.example.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "vouchers")
public class Voucher {
    @Id
    private String id;
    
    private String title;                        // Tên voucher: "Giảm 5% toàn ngành hàng"
    
    private String code;                         // Mã voucher: "GIAM5", "GIAM10"
    
    private String description;                  // Mô tả chi tiết
    
    @Field("discount_type")
    private String discountType;                 // "PERCENTAGE" hoặc "FIXED_AMOUNT"
    
    @Field("discount_value")
    private Double discountValue;                // Giá trị giảm: 5 (5%) hoặc 50000 (50k VND)
    
    @Field("max_discount_amount")
    private Double maxDiscountAmount;            // Giảm tối đa (cho loại percentage): 100000
    
    @Field("min_order_value")
    private Double minOrderValue;                // Đơn hàng tối thiểu để áp dụng: 500000
    
    @Field("points_required")
    private Integer pointsRequired;              // Điểm cần để đổi voucher: 100
    
    @Field("usage_limit")
    private Integer usageLimit;                  // Số lần sử dụng tối đa (null = không giới hạn)
    
    @Field("used_count")
    private Integer usedCount = 0;               // Số lần đã sử dụng
    
    @Field("start_date")
    private LocalDateTime startDate;             // Ngày bắt đầu hiệu lực
    
    @Field("end_date")
    private LocalDateTime endDate;               // Ngày hết hạn
    
    @Field("is_active")
    private Boolean isActive = true;             // Trạng thái hoạt động
    
    @Field("applicable_categories")
    private String applicableCategories;         // Danh mục áp dụng (null = tất cả)
    
    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;
    
    // Helper method để kiểm tra voucher còn hiệu lực
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        boolean withinDateRange = (startDate == null || now.isAfter(startDate)) 
                && (endDate == null || now.isBefore(endDate));
        boolean hasUsageLeft = usageLimit == null || usedCount < usageLimit;
        return isActive && withinDateRange && hasUsageLeft;
    }
    
    // Tính số tiền giảm
    public double calculateDiscount(double orderTotal) {
        if (!isValid() || orderTotal < (minOrderValue != null ? minOrderValue : 0)) {
            return 0;
        }
        
        double discount;
        if ("PERCENTAGE".equals(discountType)) {
            discount = orderTotal * discountValue / 100;
            if (maxDiscountAmount != null && discount > maxDiscountAmount) {
                discount = maxDiscountAmount;
            }
        } else {
            discount = discountValue;
        }
        
        return Math.min(discount, orderTotal);
    }
}
