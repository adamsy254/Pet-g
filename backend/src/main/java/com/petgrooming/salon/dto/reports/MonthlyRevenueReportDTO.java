package com.petgrooming.salon.dto.reports;

import java.math.BigDecimal;
import java.util.List;

public class MonthlyRevenueReportDTO {

    private String yearMonth;
    private int totalAppointments;
    private int completedAppointments;
    private int cancelledAppointments;
    private int noShowAppointments;
    private BigDecimal totalRevenue;
    private BigDecimal averageTicketSize;
    private List<DailyRevenueItem> dailyBreakdown;

    public static class DailyRevenueItem {
        private String date;
        private String dayOfWeek;
        private int count;
        private int completedCount;
        private int cancelledCount;
        private BigDecimal revenue;

        public DailyRevenueItem() {
        }

        public DailyRevenueItem(String date, String dayOfWeek, int count,
                                int completedCount, int cancelledCount,
                                BigDecimal revenue) {
            this.date = date;
            this.dayOfWeek = dayOfWeek;
            this.count = count;
            this.completedCount = completedCount;
            this.cancelledCount = cancelledCount;
            this.revenue = revenue;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public String getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }

        public int getCompletedCount() { return completedCount; }
        public void setCompletedCount(int completedCount) { this.completedCount = completedCount; }

        public int getCancelledCount() { return cancelledCount; }
        public void setCancelledCount(int cancelledCount) { this.cancelledCount = cancelledCount; }

        public BigDecimal getRevenue() { return revenue; }
        public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
    }

    public MonthlyRevenueReportDTO() {
    }

    public String getYearMonth() { return yearMonth; }
    public void setYearMonth(String yearMonth) { this.yearMonth = yearMonth; }

    public int getTotalAppointments() { return totalAppointments; }
    public void setTotalAppointments(int totalAppointments) { this.totalAppointments = totalAppointments; }

    public int getCompletedAppointments() { return completedAppointments; }
    public void setCompletedAppointments(int completedAppointments) { this.completedAppointments = completedAppointments; }

    public int getCancelledAppointments() { return cancelledAppointments; }
    public void setCancelledAppointments(int cancelledAppointments) { this.cancelledAppointments = cancelledAppointments; }

    public int getNoShowAppointments() { return noShowAppointments; }
    public void setNoShowAppointments(int noShowAppointments) { this.noShowAppointments = noShowAppointments; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public BigDecimal getAverageTicketSize() { return averageTicketSize; }
    public void setAverageTicketSize(BigDecimal averageTicketSize) { this.averageTicketSize = averageTicketSize; }

    public List<DailyRevenueItem> getDailyBreakdown() { return dailyBreakdown; }
    public void setDailyBreakdown(List<DailyRevenueItem> dailyBreakdown) { this.dailyBreakdown = dailyBreakdown; }
}