package org.example.repository;

import org.example.model.Voucher;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends MongoRepository<Voucher, String> {
    
    // Tìm voucher theo code
    Optional<Voucher> findByCode(String code);
    
    // Lấy tất cả voucher đang hoạt động
    List<Voucher> findByIsActiveTrue();
    
    // Lấy voucher còn hiệu lực (đang active và chưa hết hạn)
    @Query("{ 'isActive': true, 'startDate': { $lte: ?0 }, 'endDate': { $gte: ?0 } }")
    List<Voucher> findActiveVouchers(LocalDateTime now);
    
    // Lấy voucher có thể đổi bằng điểm
    @Query("{ 'isActive': true, 'pointsRequired': { $lte: ?0 } }")
    List<Voucher> findVouchersRedeemableWithPoints(Integer points);
    
    // Lấy voucher theo danh mục
    List<Voucher> findByIsActiveTrueAndApplicableCategoriesContaining(String category);
    
    // Kiểm tra voucher code có tồn tại không
    boolean existsByCode(String code);
    
    // Tìm voucher theo discount type
    List<Voucher> findByDiscountType(String discountType);
    
    // Lấy tất cả voucher đang active và có thể đổi bằng điểm
    @Query("{ 'isActive': true, 'pointsRequired': { $ne: null, $gt: 0 } }")
    List<Voucher> findAllRedeemableVouchers();
}
