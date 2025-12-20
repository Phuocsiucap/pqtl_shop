package org.example.controller;

import org.example.dto.RevenueReportDTO;
import org.example.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
@CrossOrigin(origins = "*") // Hoặc cấu hình cụ thể
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        try {
            LocalDateTime start;
            LocalDateTime end;

            if (startDate != null && !startDate.isEmpty()) {
                start = LocalDate.parse(startDate).atStartOfDay();
            } else {
                start = LocalDate.now().minusDays(30).atStartOfDay(); // Default 30 ngày
            }

            if (endDate != null && !endDate.isEmpty()) {
                end = LocalDate.parse(endDate).atTime(LocalTime.MAX);
            } else {
                end = LocalDateTime.now();
            }

            RevenueReportDTO report = reportService.getRevenueReport(start, end);
            return ResponseEntity.ok(report);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi tạo báo cáo: " + e.getMessage()));
        }
    }
}
