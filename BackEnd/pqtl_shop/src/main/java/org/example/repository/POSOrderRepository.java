package org.example.repository;

import org.example.model.POSOrder;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface POSOrderRepository extends MongoRepository<POSOrder, String> {
    
    /**
     * Tìm tất cả đơn POS của một ca làm việc
     */
    List<POSOrder> findByShiftHandoverIdOrderByOrderTimeDesc(String shiftHandoverId);
    
    /**
     * Tìm tất cả đơn POS của một nhân viên
     */
    List<POSOrder> findByEmployeeIdOrderByOrderTimeDesc(String employeeId);
    
    /**
     * Tìm đơn POS theo trạng thái
     */
    List<POSOrder> findByStatusOrderByOrderTimeDesc(String status);
    
    /**
     * Tìm đơn POS theo phương thức thanh toán
     */
    List<POSOrder> findByPaymentMethodOrderByOrderTimeDesc(String paymentMethod);
    
    /**
     * Tìm đơn POS trong khoảng thời gian
     */
    @Query("{ 'orderTime': { $gte: ?0, $lte: ?1 } }")
    List<POSOrder> findByOrderTimeBetween(LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * Tìm đơn POS theo mã đơn
     */
    POSOrder findByPosOrderCode(String posOrderCode);
    
    /**
     * Tìm đơn POS theo số điện thoại khách hàng
     */
    List<POSOrder> findByCustomerPhoneOrderByOrderTimeDesc(String customerPhone);
    
    /**
     * Đếm số đơn trong ca
     */
    long countByShiftHandoverId(String shiftHandoverId);
    
    /**
     * Đếm số đơn theo trạng thái trong ca
     */
    long countByShiftHandoverIdAndStatus(String shiftHandoverId, String status);
    
    /**
     * Đếm số đơn theo phương thức thanh toán trong ca
     */
    long countByShiftHandoverIdAndPaymentMethod(String shiftHandoverId, String paymentMethod);
    
    /**
     * Tìm tất cả đơn POS sắp xếp theo thời gian giảm dần
     */
    List<POSOrder> findAllByOrderByOrderTimeDesc();
    
    /**
     * Tìm mã đơn POS cuối cùng trong ngày để tạo mã mới
     */
    @Query(value = "{ 'posOrderCode': { $regex: ?0 } }", sort = "{ 'posOrderCode': -1 }")
    List<POSOrder> findLastOrderCodeByDatePattern(String datePattern);
}
