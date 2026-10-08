package com.petgrooming.salon.dto.reports;

import java.math.BigDecimal;
import java.util.List;

public class ServicePopularityReportDTO {

    private List<ServiceStatItem> serviceStats;
    private int totalServiceBookings;
    private BigDecimal totalServicesRevenue;

    public static class ServiceStatItem {
        private Long serviceId;
        private String serviceName;
        private String category;
        private BigDecimal basePrice;
        private int bookingCount;
        private BigDecimal revenueGenerated;
        private double percentageOfTotalBookings;

        public ServiceStatItem() {
        }

        public Long getServiceId() { return serviceId; }
        public void setServiceId(Long serviceId) { this.serviceId = serviceId; }

        public String getServiceName() { return serviceName; }
        public void setServiceName(String serviceName) { this.serviceName = serviceName; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public BigDecimal getBasePrice() { return basePrice; }
        public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }

        public int getBookingCount() { return bookingCount; }
        public void setBookingCount(int bookingCount) { this.bookingCount = bookingCount; }

        public BigDecimal getRevenueGenerated() { return revenueGenerated; }
        public void setRevenueGenerated(BigDecimal revenueGenerated) { this.revenueGenerated = revenueGenerated; }

        public double getPercentageOfTotalBookings() { return percentageOfTotalBookings; }
        public void setPercentageOfTotalBookings(double percentageOfTotalBookings) {
            this.percentageOfTotalBookings = percentageOfTotalBookings;
        }
    }

    public ServicePopularityReportDTO() {
    }

    public List<ServiceStatItem> getServiceStats() { return serviceStats; }
    public void setServiceStats(List<ServiceStatItem> serviceStats) { this.serviceStats = serviceStats; }

    public int getTotalServiceBookings() { return totalServiceBookings; }
    public void setTotalServiceBookings(int totalServiceBookings) { this.totalServiceBookings = totalServiceBookings; }

    public BigDecimal getTotalServicesRevenue() { return totalServicesRevenue; }
    public void setTotalServicesRevenue(BigDecimal totalServicesRevenue) { this.totalServicesRevenue = totalServicesRevenue; }
}