package com.petgrooming.salon.dto.reports;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class DailyScheduleReportDTO {

    private LocalDate date;
    private List<DailyScheduleItem> items;
    private int totalAppointments;
    private BigDecimal expectedRevenue;

    public static class DailyScheduleItem {
        private Long appointmentId;
        private LocalTime startTime;
        private LocalTime endTime;
        private String customerName;
        private String customerPhone;
        private String petName;
        private String petSpecies;
        private String groomerName;
        private List<String> services;
        private String status;
        private BigDecimal price;

        public DailyScheduleItem() {
        }

        public Long getAppointmentId() {
            return appointmentId;
        }

        public void setAppointmentId(Long appointmentId) {
            this.appointmentId = appointmentId;
        }

        public LocalTime getStartTime() {
            return startTime;
        }

        public void setStartTime(LocalTime startTime) {
            this.startTime = startTime;
        }

        public LocalTime getEndTime() {
            return endTime;
        }

        public void setEndTime(LocalTime endTime) {
            this.endTime = endTime;
        }

        public String getCustomerName() {
            return customerName;
        }

        public void setCustomerName(String customerName) {
            this.customerName = customerName;
        }

        public String getCustomerPhone() {
            return customerPhone;
        }

        public void setCustomerPhone(String customerPhone) {
            this.customerPhone = customerPhone;
        }

        public String getPetName() {
            return petName;
        }

        public void setPetName(String petName) {
            this.petName = petName;
        }

        public String getPetSpecies() {
            return petSpecies;
        }

        public void setPetSpecies(String petSpecies) {
            this.petSpecies = petSpecies;
        }

        public String getGroomerName() {
            return groomerName;
        }

        public void setGroomerName(String groomerName) {
            this.groomerName = groomerName;
        }

        public List<String> getServices() {
            return services;
        }

        public void setServices(List<String> services) {
            this.services = services;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public BigDecimal getPrice() {
            return price;
        }

        public void setPrice(BigDecimal price) {
            this.price = price;
        }
    }

    public DailyScheduleReportDTO() {
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public List<DailyScheduleItem> getItems() {
        return items;
    }

    public void setItems(List<DailyScheduleItem> items) {
        this.items = items;
    }

    public int getTotalAppointments() {
        return totalAppointments;
    }

    public void setTotalAppointments(int totalAppointments) {
        this.totalAppointments = totalAppointments;
    }

    public BigDecimal getExpectedRevenue() {
        return expectedRevenue;
    }

    public void setExpectedRevenue(BigDecimal expectedRevenue) {
        this.expectedRevenue = expectedRevenue;
    }
}
