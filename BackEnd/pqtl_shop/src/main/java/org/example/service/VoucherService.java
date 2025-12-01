package org.example.service;

import org.example.dto.request.VoucherApplyRequest;
import org.example.dto.request.VoucherCreateRequest;
import org.example.dto.request.VoucherUpdateRequest;
import org.example.dto.response.UserVoucherResponse;
import org.example.dto.response.VoucherApplyResponse;
import org.example.dto.response.VoucherResponse;
import org.example.model.UserVoucher;
import org.example.model.Voucher;
import org.example.model.login.User;
import org.example.repository.UserVoucherRepository;
import org.example.repository.VoucherRepository;
import org.example.repository.login.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VoucherService {

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private UserVoucherRepository userVoucherRepository;

    @Autowired
    private UserRepository userRepository;

    // ==================== ADMIN APIs ====================

    /**
     * Tạo voucher mới
     */
    public VoucherResponse createVoucher(VoucherCreateRequest request) {
        // Kiểm tra mã voucher đã tồn tại
        if (request.getCode() != null && voucherRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Mã voucher đã tồn tại");
        }

        Voucher voucher = Voucher.builder()
                .title(request.getTitle())
                .code(request.getCode())
                .description(request.getDescription())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .minOrderValue(request.getMinOrderValue())
                .pointsRequired(request.getPointsRequired())
                .usageLimit(request.getUsageLimit())
                .usedCount(0)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .applicableCategories(request.getApplicableCategories())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Voucher saved = voucherRepository.save(voucher);
        return mapToVoucherResponse(saved);
    }

    /**
     * Cập nhật voucher
     */
    public VoucherResponse updateVoucher(String voucherId, VoucherUpdateRequest request) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher"));

        // Kiểm tra mã mới có trùng không
        if (request.getCode() != null && !request.getCode().equals(voucher.getCode())) {
            if (voucherRepository.existsByCode(request.getCode())) {
                throw new RuntimeException("Mã voucher đã tồn tại");
            }
            voucher.setCode(request.getCode());
        }

        if (request.getTitle() != null) voucher.setTitle(request.getTitle());
        if (request.getDescription() != null) voucher.setDescription(request.getDescription());
        if (request.getDiscountType() != null) voucher.setDiscountType(request.getDiscountType());
        if (request.getDiscountValue() != null) voucher.setDiscountValue(request.getDiscountValue());
        if (request.getMaxDiscountAmount() != null) voucher.setMaxDiscountAmount(request.getMaxDiscountAmount());
        if (request.getMinOrderValue() != null) voucher.setMinOrderValue(request.getMinOrderValue());
        if (request.getPointsRequired() != null) voucher.setPointsRequired(request.getPointsRequired());
        if (request.getUsageLimit() != null) voucher.setUsageLimit(request.getUsageLimit());
        if (request.getStartDate() != null) voucher.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) voucher.setEndDate(request.getEndDate());
        if (request.getIsActive() != null) voucher.setIsActive(request.getIsActive());
        if (request.getApplicableCategories() != null) voucher.setApplicableCategories(request.getApplicableCategories());

        voucher.setUpdatedAt(LocalDateTime.now());

        Voucher saved = voucherRepository.save(voucher);
        return mapToVoucherResponse(saved);
    }

    /**
     * Xóa voucher
     */
    public void deleteVoucher(String voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher"));
        voucherRepository.delete(voucher);
    }

    /**
     * Lấy tất cả vouchers (Admin)
     */
    public List<VoucherResponse> getAllVouchers() {
        return voucherRepository.findAll().stream()
                .map(this::mapToVoucherResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy voucher theo ID
     */
    public VoucherResponse getVoucherById(String voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher"));
        return mapToVoucherResponse(voucher);
    }

    /**
     * Kích hoạt/vô hiệu hóa voucher
     */
    public VoucherResponse toggleVoucherStatus(String voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher"));
        voucher.setIsActive(!voucher.getIsActive());
        voucher.setUpdatedAt(LocalDateTime.now());
        Voucher saved = voucherRepository.save(voucher);
        return mapToVoucherResponse(saved);
    }

    // ==================== CUSTOMER APIs ====================

    /**
     * Lấy danh sách voucher có thể đổi (cho customer)
     */
    public List<VoucherResponse> getAvailableVouchers() {
        return voucherRepository.findByIsActiveTrue().stream()
                .filter(Voucher::isValid)
                .filter(v -> v.getPointsRequired() != null && v.getPointsRequired() > 0)
                .map(this::mapToVoucherResponse)
                .collect(Collectors.toList());
    }

    /**
     * Đổi điểm lấy voucher
     */
    @Transactional
    public UserVoucherResponse redeemVoucher(String userId, String voucherId) {
        // Lấy user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Lấy voucher
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy voucher"));

        // Kiểm tra voucher còn hiệu lực
        if (!voucher.isValid()) {
            throw new RuntimeException("Voucher đã hết hiệu lực hoặc đã hết lượt sử dụng");
        }

        // Kiểm tra đã đổi voucher này chưa
        if (userVoucherRepository.existsByUserIdAndVoucherId(userId, voucherId)) {
            throw new RuntimeException("Bạn đã đổi voucher này rồi");
        }

        // Kiểm tra đủ điểm
        Integer userPoints = user.getLoyaltyPoints() != null ? user.getLoyaltyPoints() : 0;
        if (userPoints < voucher.getPointsRequired()) {
            throw new RuntimeException("Bạn không đủ điểm để đổi voucher này");
        }

        // Trừ điểm user
        user.setLoyaltyPoints(userPoints - voucher.getPointsRequired());
        userRepository.save(user);

        // Tạo user voucher
        UserVoucher userVoucher = UserVoucher.builder()
                .userId(userId)
                .voucherId(voucherId)
                .isUsed(false)
                .pointsSpent(voucher.getPointsRequired())
                .redeemedAt(LocalDateTime.now())
                .expiresAt(voucher.getEndDate())
                .build();

        UserVoucher saved = userVoucherRepository.save(userVoucher);
        return mapToUserVoucherResponse(saved, voucher);
    }

    /**
     * Lấy danh sách voucher đã đổi của user
     */
    public List<UserVoucherResponse> getUserRedeemedVouchers(String userId) {
        List<UserVoucher> userVouchers = userVoucherRepository.findByUserId(userId);
        return userVouchers.stream()
                .map(uv -> {
                    Voucher voucher = voucherRepository.findById(uv.getVoucherId()).orElse(null);
                    return mapToUserVoucherResponse(uv, voucher);
                })
                .collect(Collectors.toList());
    }

    /**
     * Lấy voucher chưa sử dụng của user
     */
    public List<UserVoucherResponse> getUserUnusedVouchers(String userId) {
        List<UserVoucher> userVouchers = userVoucherRepository.findByUserIdAndIsUsedFalse(userId);
        return userVouchers.stream()
                .map(uv -> {
                    Voucher voucher = voucherRepository.findById(uv.getVoucherId()).orElse(null);
                    return mapToUserVoucherResponse(uv, voucher);
                })
                .collect(Collectors.toList());
    }

    /**
     * Áp dụng voucher vào đơn hàng
     */
    public VoucherApplyResponse applyVoucher(String userId, VoucherApplyRequest request) {
        // Tìm voucher theo code
        Voucher voucher = voucherRepository.findByCode(request.getVoucherCode())
                .orElseThrow(() -> new RuntimeException("Mã voucher không hợp lệ"));

        // Kiểm tra user có voucher này không
        UserVoucher userVoucher = userVoucherRepository
                .findByUserIdAndVoucherIdAndIsUsedFalse(userId, voucher.getId())
                .orElseThrow(() -> new RuntimeException("Bạn chưa sở hữu voucher này hoặc đã sử dụng"));

        // Kiểm tra voucher còn hiệu lực
        if (!voucher.isValid()) {
            return VoucherApplyResponse.builder()
                    .success(false)
                    .message("Voucher đã hết hiệu lực")
                    .build();
        }

        // Kiểm tra đơn hàng tối thiểu
        if (voucher.getMinOrderValue() != null && request.getOrderTotal() < voucher.getMinOrderValue()) {
            return VoucherApplyResponse.builder()
                    .success(false)
                    .message("Đơn hàng chưa đạt giá trị tối thiểu " + voucher.getMinOrderValue() + " VND")
                    .build();
        }

        // Tính số tiền giảm
        double discountAmount = voucher.calculateDiscount(request.getOrderTotal());
        double finalAmount = request.getOrderTotal() - discountAmount;

        return VoucherApplyResponse.builder()
                .success(true)
                .message("Áp dụng voucher thành công")
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .voucher(mapToVoucherResponse(voucher))
                .build();
    }

    /**
     * Sử dụng voucher cho đơn hàng (gọi khi đặt hàng thành công)
     */
    @Transactional
    public void useVoucher(String userId, String voucherCode, String orderId) {
        Voucher voucher = voucherRepository.findByCode(voucherCode)
                .orElseThrow(() -> new RuntimeException("Mã voucher không hợp lệ"));

        UserVoucher userVoucher = userVoucherRepository
                .findByUserIdAndVoucherIdAndIsUsedFalse(userId, voucher.getId())
                .orElseThrow(() -> new RuntimeException("Voucher không hợp lệ"));

        // Cập nhật user voucher
        userVoucher.setIsUsed(true);
        userVoucher.setUsedAt(LocalDateTime.now());
        userVoucher.setOrderId(orderId);
        userVoucherRepository.save(userVoucher);

        // Tăng used count của voucher
        voucher.setUsedCount(voucher.getUsedCount() + 1);
        voucherRepository.save(voucher);
    }

    // ==================== MAPPER ====================

    private VoucherResponse mapToVoucherResponse(Voucher voucher) {
        if (voucher == null) return null;
        return VoucherResponse.builder()
                .id(voucher.getId())
                .title(voucher.getTitle())
                .code(voucher.getCode())
                .description(voucher.getDescription())
                .discountType(voucher.getDiscountType())
                .discountValue(voucher.getDiscountValue())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .minOrderValue(voucher.getMinOrderValue())
                .pointsRequired(voucher.getPointsRequired())
                .usageLimit(voucher.getUsageLimit())
                .usedCount(voucher.getUsedCount())
                .startDate(voucher.getStartDate())
                .endDate(voucher.getEndDate())
                .isActive(voucher.getIsActive())
                .applicableCategories(voucher.getApplicableCategories())
                .createdAt(voucher.getCreatedAt())
                .updatedAt(voucher.getUpdatedAt())
                .isValid(voucher.isValid())
                .build();
    }

    private UserVoucherResponse mapToUserVoucherResponse(UserVoucher userVoucher, Voucher voucher) {
        return UserVoucherResponse.builder()
                .id(userVoucher.getId())
                .userId(userVoucher.getUserId())
                .voucher(mapToVoucherResponse(voucher))
                .isUsed(userVoucher.getIsUsed())
                .usedAt(userVoucher.getUsedAt())
                .orderId(userVoucher.getOrderId())
                .pointsSpent(userVoucher.getPointsSpent())
                .redeemedAt(userVoucher.getRedeemedAt())
                .expiresAt(userVoucher.getExpiresAt())
                .build();
    }
}
