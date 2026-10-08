package com.petgrooming.salon.controller;

import com.petgrooming.salon.dto.reports.*;
import com.petgrooming.salon.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/daily")
    public ResponseEntity<DailyScheduleReportDTO> getDailySchedule(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reportService.getDailyScheduleReport(date));
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MonthlyRevenueReportDTO> getMonthlyRevenue(
            @RequestParam(required = false) String month) {
        YearMonth targetMonth = month != null ? YearMonth.parse(month) : YearMonth.now();
        return ResponseEntity.ok(reportService.getMonthlyRevenueReport(targetMonth));
    }

    @GetMapping("/services")
    public ResponseEntity<ServicePopularityReportDTO> getServicePopularity() {
        return ResponseEntity.ok(reportService.getServicePopularityReport());
    }

    @GetMapping("/customers")
    public ResponseEntity<CustomerRetentionReportDTO> getCustomerRetention() {
        return ResponseEntity.ok(reportService.getCustomerRetentionReport());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary() {
        return ResponseEntity.ok(reportService.getDashboardSummary());
    }
}
