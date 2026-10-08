package com.petgrooming.salon.dto.reports;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class CustomerRetentionReportDTO {

    private List<CustomerRetentionItem> customerStats;
    private int totalCustomers;
    private int activeCustomersWithAppointments;
    private int lapsedCount;
    private double retentionRate;
    private BigDecimal averageCustomerLifetimeValue;

    public static class CustomerRetentionItem {
        private Long customerId;
        private String customerName;
        private String email;
        private String phone;
        private int petCount;
        private int appointmentCount;
        private LocalDate firstAppointmentDate;
        private LocalDate lastAppointmentDate;
        private BigDecimal totalAmountSpent;
        private String status;

        public CustomerRetentionItem() {}

        public Long getCustomerId() { return customerId; }
        public void setCustomerId(Long customerId) { this.customerId = customerId; }

        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public int getPetCount() { return petCount; }
        public void setPetCount(int petCount) { this.petCount = petCount; }

        public int getAppointmentCount() { return appointmentCount; }
        public void setAppointmentCount(int appointmentCount) { this.appointmentCount = appointmentCount; }

        public LocalDate getFirstAppointmentDate() { return firstAppointmentDate; }
        public void setFirstAppointmentDate(LocalDate firstAppointmentDate) { this.firstAppointmentDate = firstAppointmentDate; }

        public LocalDate getLastAppointmentDate() { return lastAppointmentDate; }
        public void setLastAppointmentDate(LocalDate lastAppointmentDate) { this.lastAppointmentDate = lastAppointmentDate; }

        public BigDecimal getTotalAmountSpent() { return totalAmountSpent; }
        public void setTotalAmountSpent(BigDecimal totalAmountSpent) { this.totalAmountSpent = totalAmountSpent; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public CustomerRetentionReportDTO() {}

    public List<CustomerRetentionItem> getCustomerStats() { return customerStats; }
    public void setCustomerStats(List<CustomerRetentionItem> customerStats) { this.customerStats = customerStats; }

    public int getTotalCustomers() { return totalCustomers; }
    public void setTotalCustomers(int totalCustomers) { this.totalCustomers = totalCustomers; }

    public int getActiveCustomersWithAppointments() { return activeCustomersWithAppointments; }
    public void setActiveCustomersWithAppointments(int activeCustomersWithAppointments) {
        this.activeCustomersWithAppointments = activeCustomersWithAppointments;
    }

    public int getLapsedCount() { return lapsedCount; }
    public void setLapsedCount(int lapsedCount) { this.lapsedCount = lapsedCount; }

    public double getRetentionRate() { return retentionRate; }
    public void setRetentionRate(double retentionRate) { this.retentionRate = retentionRate; }

    public BigDecimal getAverageCustomerLifetimeValue() { return averageCustomerLifetimeValue; }
    public void setAverageCustomerLifetimeValue(BigDecimal averageCustomerLifetimeValue) {
        this.averageCustomerLifetimeValue = averageCustomerLifetimeValue;
    }
}