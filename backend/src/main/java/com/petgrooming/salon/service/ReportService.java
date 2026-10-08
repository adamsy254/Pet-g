package com.petgrooming.salon.service;

import com.petgrooming.salon.dto.AppointmentDTO;
import com.petgrooming.salon.dto.reports.*;
import com.petgrooming.salon.entity.*;
import com.petgrooming.salon.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ReportService {

    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final PetRepository petRepository;
    private final GroomingServiceRepository serviceRepository;

    public ReportService(AppointmentRepository appointmentRepository,
                         CustomerRepository customerRepository,
                         PetRepository petRepository,
                         GroomingServiceRepository serviceRepository) {
        this.appointmentRepository = appointmentRepository;
        this.customerRepository = customerRepository;
        this.petRepository = petRepository;
        this.serviceRepository = serviceRepository;
    }

    // =====================================================================
    // Daily schedule
    // =====================================================================
    public DailyScheduleReportDTO getDailyScheduleReport(LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<Appointment> apps = appointmentRepository.findByAppointmentDateOrderByStartTimeAsc(targetDate);

        BigDecimal revenue = BigDecimal.ZERO;
        List<DailyScheduleReportDTO.DailyScheduleItem> items = new ArrayList<>();

        for (Appointment a : apps) {
            DailyScheduleReportDTO.DailyScheduleItem item = new DailyScheduleReportDTO.DailyScheduleItem();
            item.setAppointmentId(a.getId());
            item.setStartTime(a.getStartTime());
            item.setEndTime(a.getEndTime());
            item.setCustomerName(a.getCustomer().getFullName());
            item.setCustomerPhone(a.getCustomer().getPhone());
            item.setPetName(a.getPet().getName());
            item.setPetSpecies(a.getPet().getSpecies());
            item.setGroomerName(a.getGroomer().getFullName());
            item.setStatus(a.getStatus().name());
            item.setPrice(a.getCalculatedPrice());
            item.setServices(a.getServices().stream()
                    .map(GroomingService::getName)
                    .collect(Collectors.toList()));
            items.add(item);

            if (a.getStatus() == AppointmentStatus.COMPLETED
                    || a.getStatus() == AppointmentStatus.CONFIRMED
                    || a.getStatus() == AppointmentStatus.SCHEDULED) {
                revenue = revenue.add(a.getCalculatedPrice());
            }
        }

        DailyScheduleReportDTO report = new DailyScheduleReportDTO();
        report.setDate(targetDate);
        report.setItems(items);
        report.setTotalAppointments(items.size());
        report.setExpectedRevenue(revenue);
        return report;
    }

    // =====================================================================
    // Monthly revenue
    // =====================================================================
    public MonthlyRevenueReportDTO getMonthlyRevenueReport(YearMonth month) {
        YearMonth targetMonth = month != null ? month : YearMonth.now();
        LocalDate startDate = targetMonth.atDay(1);
        LocalDate endDate = targetMonth.atEndOfMonth();

        List<Appointment> apps = appointmentRepository.findByAppointmentDateBetween(startDate, endDate);

        int total = apps.size();
        int completed = 0;
        int cancelled = 0;
        int noShows = 0;
        BigDecimal totalRevenue = BigDecimal.ZERO;

        Map<LocalDate, List<Appointment>> byDate = new TreeMap<>();
        for (Appointment a : apps) {
            byDate.computeIfAbsent(a.getAppointmentDate(), k -> new ArrayList<>()).add(a);
            switch (a.getStatus()) {
                case COMPLETED -> {
                    completed++;
                    totalRevenue = totalRevenue.add(a.getCalculatedPrice());
                }
                case CANCELLED -> cancelled++;
                case NO_SHOW -> noShows++;
                default -> {}
            }
        }

        List<MonthlyRevenueReportDTO.DailyRevenueItem> dailyBreakdown = new ArrayList<>();
        for (Map.Entry<LocalDate, List<Appointment>> entry : byDate.entrySet()) {
            LocalDate day = entry.getKey();
            List<Appointment> dayApps = entry.getValue();

            BigDecimal dayRev = BigDecimal.ZERO;
            int dayCompleted = 0;
            int dayCancelled = 0;

            for (Appointment a : dayApps) {
                if (a.getStatus() == AppointmentStatus.COMPLETED) {
                    dayRev = dayRev.add(a.getCalculatedPrice());
                    dayCompleted++;
                } else if (a.getStatus() == AppointmentStatus.CANCELLED) {
                    dayCancelled++;
                }
            }

            dailyBreakdown.add(new MonthlyRevenueReportDTO.DailyRevenueItem(
                    day.toString(),
                    day.getDayOfWeek().toString(),
                    dayApps.size(),
                    dayCompleted,
                    dayCancelled,
                    dayRev
            ));
        }

        BigDecimal avgTicket = completed > 0
                ? totalRevenue.divide(BigDecimal.valueOf(completed), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        MonthlyRevenueReportDTO report = new MonthlyRevenueReportDTO();
        report.setYearMonth(targetMonth.toString());
        report.setTotalAppointments(total);
        report.setCompletedAppointments(completed);
        report.setCancelledAppointments(cancelled);
        report.setNoShowAppointments(noShows);
        report.setTotalRevenue(totalRevenue);
        report.setAverageTicketSize(avgTicket);
        report.setDailyBreakdown(dailyBreakdown);
        return report;
    }

    // =====================================================================
    // Service popularity
    // =====================================================================
    public ServicePopularityReportDTO getServicePopularityReport() {
        List<GroomingService> allServices = serviceRepository.findAll();
        List<Appointment> allAppointments = appointmentRepository.findAll();

        Map<Long, Integer> serviceCounts = new HashMap<>();
        Map<Long, BigDecimal> serviceRevenues = new HashMap<>();
        int totalBookings = 0;
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (Appointment a : allAppointments) {
            if (a.getStatus() != AppointmentStatus.CANCELLED) {
                for (GroomingService s : a.getServices()) {
                    serviceCounts.merge(s.getId(), 1, Integer::sum);
                    serviceRevenues.merge(s.getId(), s.getBasePrice(), BigDecimal::add);
                    totalBookings++;
                    totalRevenue = totalRevenue.add(s.getBasePrice());
                }
            }
        }

        List<ServicePopularityReportDTO.ServiceStatItem> stats = new ArrayList<>();
        for (GroomingService s : allServices) {
            ServicePopularityReportDTO.ServiceStatItem item = new ServicePopularityReportDTO.ServiceStatItem();
            item.setServiceId(s.getId());
            item.setServiceName(s.getName());
            item.setCategory("Grooming");
            item.setBasePrice(s.getBasePrice());
            int count = serviceCounts.getOrDefault(s.getId(), 0);
            item.setBookingCount(count);
            item.setRevenueGenerated(serviceRevenues.getOrDefault(s.getId(), BigDecimal.ZERO));
            double pct = totalBookings > 0 ? ((double) count / totalBookings) * 100.0 : 0.0;
            item.setPercentageOfTotalBookings(Math.round(pct * 10.0) / 10.0);
            stats.add(item);
        }

        stats.sort((a, b) -> Integer.compare(b.getBookingCount(), a.getBookingCount()));

        ServicePopularityReportDTO report = new ServicePopularityReportDTO();
        report.setServiceStats(stats);
        report.setTotalServiceBookings(totalBookings);
        report.setTotalServicesRevenue(totalRevenue);
        return report;
    }

    // =====================================================================
    // Customer retention
    // =====================================================================
    public CustomerRetentionReportDTO getCustomerRetentionReport() {
        List<Customer> customers = customerRepository.findAll();
        List<CustomerRetentionReportDTO.CustomerRetentionItem> items = new ArrayList<>();

        int activeCount = 0;
        int lapsedCount = 0;
        BigDecimal totalSpentAll = BigDecimal.ZERO;

        for (Customer c : customers) {
            List<Appointment> apps = appointmentRepository
                    .findByCustomerIdOrderByAppointmentDateDescStartTimeDesc(c.getId());

            CustomerRetentionReportDTO.CustomerRetentionItem item = new CustomerRetentionReportDTO.CustomerRetentionItem();
            item.setCustomerId(c.getId());
            item.setCustomerName(c.getFullName());
            item.setEmail(c.getEmail());
            item.setPhone(c.getPhone());
            item.setPetCount(c.getPets().size());
            item.setAppointmentCount(apps.size());

            BigDecimal spent = BigDecimal.ZERO;
            LocalDate firstDate = null;
            LocalDate lastDate = null;

            for (Appointment a : apps) {
                if (a.getStatus() == AppointmentStatus.COMPLETED) {
                    spent = spent.add(a.getCalculatedPrice());
                }
                if (lastDate == null || a.getAppointmentDate().isAfter(lastDate)) {
                    lastDate = a.getAppointmentDate();
                }
                if (firstDate == null || a.getAppointmentDate().isBefore(firstDate)) {
                    firstDate = a.getAppointmentDate();
                }
            }

            item.setFirstAppointmentDate(firstDate);
            item.setLastAppointmentDate(lastDate);
            item.setTotalAmountSpent(spent);

            if (apps.isEmpty()) {
                item.setStatus("New");
            } else if (lastDate != null && lastDate.isAfter(LocalDate.now().minusMonths(2))) {
                item.setStatus("Active");
                activeCount++;
                totalSpentAll = totalSpentAll.add(spent);
            } else {
                item.setStatus("Lapsed");
                lapsedCount++;
                totalSpentAll = totalSpentAll.add(spent);
            }

            items.add(item);
        }

        items.sort((a, b) -> b.getTotalAmountSpent().compareTo(a.getTotalAmountSpent()));

        BigDecimal avgLtv = (activeCount + lapsedCount) > 0
                ? totalSpentAll.divide(BigDecimal.valueOf(activeCount + lapsedCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        double retentionRate = customers.isEmpty()
                ? 0.0
                : Math.round(((double) activeCount / customers.size()) * 1000.0) / 10.0;

        CustomerRetentionReportDTO report = new CustomerRetentionReportDTO();
        report.setCustomerStats(items);
        report.setTotalCustomers(customers.size());
        report.setActiveCustomersWithAppointments(activeCount);
        report.setLapsedCount(lapsedCount);
        report.setRetentionRate(retentionRate);
        report.setAverageCustomerLifetimeValue(avgLtv);
        return report;
    }

    // =====================================================================
    // Dashboard summary
    // =====================================================================
    public DashboardSummaryDTO getDashboardSummary() {
        LocalDate today = LocalDate.now();
        List<Appointment> todayApps = appointmentRepository.findByAppointmentDateOrderByStartTimeAsc(today);
        List<Appointment> allApps = appointmentRepository.findAll();

        long todayCount = todayApps.size();
        long upcomingCount = allApps.stream()
                .filter(a -> a.getAppointmentDate().isAfter(today)
                        && a.getStatus() != AppointmentStatus.CANCELLED)
                .count();

        long completedCount = allApps.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED)
                .count();

        long noShowCount = allApps.stream()
                .filter(a -> a.getStatus() == AppointmentStatus.NO_SHOW)
                .count();

        YearMonth currentMonth = YearMonth.now();
        BigDecimal monthlyRev = allApps.stream()
                .filter(a -> YearMonth.from(a.getAppointmentDate()).equals(currentMonth)
                        && a.getStatus() == AppointmentStatus.COMPLETED)
                .map(Appointment::getCalculatedPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<AppointmentDTO> todayList = todayApps.stream()
                .map(AppointmentDTO::new).collect(Collectors.toList());
        List<AppointmentDTO> recentList = allApps.stream()
                .sorted((a, b) -> b.getAppointmentDate().compareTo(a.getAppointmentDate()))
                .limit(5)
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());

        DashboardSummaryDTO summary = new DashboardSummaryDTO();
        summary.setTodayAppointmentsCount(todayCount);
        summary.setUpcomingAppointmentsCount(upcomingCount);
        summary.setTotalCustomersCount(customerRepository.count());
        summary.setTotalPetsCount(petRepository.count());
        summary.setMonthlyRevenue(monthlyRev);
        summary.setCompletedAppointmentsCount(completedCount);
        summary.setNoShowAppointmentsCount(noShowCount);
        summary.setTodayAppointments(todayList);
        summary.setRecentAppointments(recentList);
        return summary;
    }
}