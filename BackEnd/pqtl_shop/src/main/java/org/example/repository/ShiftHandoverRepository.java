package org.example.repository;

import org.example.model.ShiftHandover;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShiftHandoverRepository extends MongoRepository<ShiftHandover, String> {
    
    /**
     * Tìm tất cả ca làm việc của một nhân viên
     */
    List<ShiftHandover> findByEmployeeIdOrderByCreatedAtDesc(String employeeId);
    
    /**
     * Tìm ca làm việc đang mở của một nhân viên
     */
    Optional<ShiftHandover> findByEmployeeIdAndStatus(String employeeId, String status);
    
    /**
     * Tìm tất cả ca theo trạng thái
     */
    List<ShiftHandover> findByStatusOrderByCreatedAtDesc(String status);
    
    /**
     * Tìm tất cả ca trong khoảng thời gian
     */
    @Query("{ 'shiftStartTime': { $gte: ?0, $lte: ?1 } }")
    List<ShiftHandover> findByShiftStartTimeBetween(LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * Tìm tất cả ca của nhân viên trong khoảng thời gian
     */
    @Query("{ 'employeeId': ?0, 'shiftStartTime': { $gte: ?1, $lte: ?2 } }")
    List<ShiftHandover> findByEmployeeIdAndShiftStartTimeBetween(String employeeId, LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * Tìm tất cả ca sắp xếp theo thời gian tạo giảm dần
     */
    List<ShiftHandover> findAllByOrderByCreatedAtDesc();
    
    /**
     * Đếm số ca đang chờ xác nhận
     */
    long countByStatus(String status);
    
    /**
     * Tìm ca theo tên ca và ngày
     */
    @Query("{ 'shiftName': ?0, 'shiftStartTime': { $gte: ?1, $lt: ?2 } }")
    List<ShiftHandover> findByShiftNameAndDate(String shiftName, LocalDateTime startOfDay, LocalDateTime endOfDay);
}
