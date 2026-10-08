package com.petgrooming.salon.dto.reports;

import com.petgrooming.salon.dto.AppointmentDTO;
import java.math.BigDecimal;
import java.util.List;

public class DashboardSummaryDTO {

    private long todayAppointmentsCount;
    private long upcomingAppointmentsCount;
    private long totalCustomersCount;
    private long totalPetsCount;
    private BigDecimal monthlyRevenue;
    private long completedAppointmentsCount;
    private long noShowAppointmentsCount;
    private List<AppointmentDTO> todayAppointments;
    private List<AppointmentDTO> recentAppointments;

    public DashboardSummaryDTO() {
    }

    public long getTodayAppointmentsCount() {
        return todayAppointmentsCount;
    }

    public void setTodayAppointmentsCount(long todayAppointmentsCount) {
        this.todayAppointmentsCount = todayAppointmentsCount;
    }

    public long getUpcomingAppointmentsCount() {
        return upcomingAppointmentsCount;
    }

    public void setUpcomingAppointmentsCount(long upcomingAppointmentsCount) {
        this.upcomingAppointmentsCount = upcomingAppointmentsCount;
    }

    public long getTotalCustomersCount() {
        return totalCustomersCount;
    }

    public void setTotalCustomersCount(long totalCustomersCount) {
        this.totalCustomersCount = totalCustomersCount;
    }

    public long getTotalPetsCount() {
        return totalPetsCount;
    }

    public void setTotalPetsCount(long totalPetsCount) {
        this.totalPetsCount = totalPetsCount;
    }

    public BigDecimal getMonthlyRevenue() {
        return monthlyRevenue;
    }

    public void setMonthlyRevenue(BigDecimal monthlyRevenue) {
        this.monthlyRevenue = monthlyRevenue;
    }

    public long getCompletedAppointmentsCount() {
        return completedAppointmentsCount;
    }

    public void setCompletedAppointmentsCount(long completedAppointmentsCount) {
        this.completedAppointmentsCount = completedAppointmentsCount;
    }

    public long getNoShowAppointmentsCount() {
        return noShowAppointmentsCount;
    }

    public void setNoShowAppointmentsCount(long noShowAppointmentsCount) {
        this.noShowAppointmentsCount = noShowAppointmentsCount;
    }

    public List<AppointmentDTO> getTodayAppointments() {
        return todayAppointments;
    }

    public void setTodayAppointments(List<AppointmentDTO> todayAppointments) {
        this.todayAppointments = todayAppointments;
    }

    public List<AppointmentDTO> getRecentAppointments() {
        return recentAppointments;
    }

    public void setRecentAppointments(List<AppointmentDTO> recentAppointments) {
        this.recentAppointments = recentAppointments;
    }
}
