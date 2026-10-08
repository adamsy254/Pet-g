package com.petgrooming.salon.service;

import com.petgrooming.salon.dto.reports.DailyScheduleReportDTO;
import com.petgrooming.salon.entity.Appointment;
import com.petgrooming.salon.entity.AppointmentStatus;
import com.petgrooming.salon.entity.Customer;
import com.petgrooming.salon.entity.Dog;
import com.petgrooming.salon.entity.GroomingService;
import com.petgrooming.salon.entity.Pet;
import com.petgrooming.salon.entity.User;
import com.petgrooming.salon.repository.AppointmentRepository;
import com.petgrooming.salon.repository.CustomerRepository;
import com.petgrooming.salon.repository.GroomingServiceRepository;
import com.petgrooming.salon.repository.PetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock private AppointmentRepository appointmentRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private PetRepository petRepository;
    @Mock private GroomingServiceRepository serviceRepository;

    private ReportService reportService;

    @BeforeEach
    void setUp() {
        reportService = new ReportService(
                appointmentRepository,
                customerRepository,
                petRepository,
                serviceRepository);
    }

    @Test
    @DisplayName("T11 - Daily schedule totals appointments and expected revenue")
    void testDailyScheduleTotals() {
        LocalDate date = LocalDate.of(2026, 10, 15);

        Customer customer = new Customer();
        customer.setFirstName("Eleanor");
        customer.setLastName("Vance");
        customer.setPhone("555-0100");

        Pet pet = new Dog();
        pet.setName("Barnaby");

        User groomer = new User();
        groomer.setFirstName("Michael");
        groomer.setLastName("Ross");

        GroomingService service = new GroomingService(
                "Full Groom Package", "...", new BigDecimal("75.00"), 90, true);

        Appointment confirmed = new Appointment();
        confirmed.setId(1L);
        confirmed.setCustomer(customer);
        confirmed.setPet(pet);
        confirmed.setGroomer(groomer);
        confirmed.setAppointmentDate(date);
        confirmed.setStartTime(LocalTime.of(9, 0));
        confirmed.setEndTime(LocalTime.of(10, 30));
        confirmed.setStatus(AppointmentStatus.CONFIRMED);
        confirmed.setCalculatedPrice(new BigDecimal("97.50"));
        confirmed.setServices(new HashSet<>(List.of(service)));

        Appointment completed = new Appointment();
        completed.setId(2L);
        completed.setCustomer(customer);
        completed.setPet(pet);
        completed.setGroomer(groomer);
        completed.setAppointmentDate(date);
        completed.setStartTime(LocalTime.of(11, 0));
        completed.setEndTime(LocalTime.of(12, 30));
        completed.setStatus(AppointmentStatus.COMPLETED);
        completed.setCalculatedPrice(new BigDecimal("82.50"));
        completed.setServices(new HashSet<>(List.of(service)));

        when(appointmentRepository.findByAppointmentDateOrderByStartTimeAsc(date))
                .thenReturn(List.of(confirmed, completed));

        DailyScheduleReportDTO report = reportService.getDailyScheduleReport(date);

        assertEquals(2, report.getTotalAppointments());
        assertEquals(new BigDecimal("180.00"), report.getExpectedRevenue());
    }
}