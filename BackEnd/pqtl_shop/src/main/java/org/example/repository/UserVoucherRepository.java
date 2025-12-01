package org.example.repository;

import org.example.model.UserVoucher;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserVoucherRepository extends MongoRepository<UserVoucher, String> {
    
    // Lấy tất cả voucher của user
    List<UserVoucher> findByUserId(String userId);
    
    // Lấy voucher của user chưa sử dụng
    List<UserVoucher> findByUserIdAndIsUsedFalse(String userId);
    
    // Lấy voucher của user đã sử dụng
    List<UserVoucher> findByUserIdAndIsUsedTrue(String userId);
    
    // Kiểm tra user đã đổi voucher này chưa
    boolean existsByUserIdAndVoucherId(String userId, String voucherId);
    
    // Tìm user voucher cụ thể
    Optional<UserVoucher> findByUserIdAndVoucherId(String userId, String voucherId);
    
    // Tìm user voucher chưa sử dụng và chưa hết hạn
    @Query("{ 'userId': ?0, 'isUsed': false, 'expiresAt': { $gte: ?1 } }")
    List<UserVoucher> findValidVouchersForUser(String userId, LocalDateTime now);
    
    // Đếm số lần user đã sử dụng một voucher cụ thể
    long countByUserIdAndVoucherIdAndIsUsedTrue(String userId, String voucherId);
    
    // Lấy user voucher chưa sử dụng theo voucher id
    Optional<UserVoucher> findByUserIdAndVoucherIdAndIsUsedFalse(String userId, String voucherId);
}
