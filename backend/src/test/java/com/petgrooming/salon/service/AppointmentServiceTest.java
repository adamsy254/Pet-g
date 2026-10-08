package com.petgrooming.salon.service;

import com.petgrooming.salon.entity.Appointment;
import com.petgrooming.salon.entity.AppointmentStatus;
import com.petgrooming.salon.entity.Customer;
import com.petgrooming.salon.entity.Dog;
import com.petgrooming.salon.entity.Pet;
import com.petgrooming.salon.exception.DuplicateAppointmentException;
import com.petgrooming.salon.repository.AppointmentRepository;
import com.petgrooming.salon.repository.CustomerRepository;
import com.petgrooming.salon.repository.GroomingServiceRepository;
import com.petgrooming.salon.repository.PetRepository;
import com.petgrooming.salon.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;

/**
 * Verifies the double-booking prevention logic by mocking the repository
 * that returns conflicting appointments.
 */
@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock private AppointmentRepository appointmentRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private PetRepository petRepository;
    @Mock private UserRepository userRepository;
    @Mock private GroomingServiceRepository serviceRepository;
    @Mock private PricingService pricingService;

    private AppointmentService appointmentService;

    @BeforeEach
    void setUp() {
        appointmentService = new AppointmentService(
                appointmentRepository,
                customerRepository,
                petRepository,
                userRepository,
                serviceRepository,
                pricingService);
    }

    @Test
    @DisplayName("T6 - Overlapping groomer slot throws DuplicateAppointmentException")
    void testDoubleBookingRejected() {
        LocalDate date = LocalDate.of(2026, 10, 15);
        LocalTime start = LocalTime.of(9, 0);
        LocalTime end = LocalTime.of(10, 0);

        Customer customer = new Customer();
        customer.setFirstName("Other");
        customer.setLastName("Owner");

        Pet pet = new Dog();
        pet.setName("ConflictingPet");

        Appointment conflict = new Appointment();
        conflict.setId(99L);
        conflict.setCustomer(customer);
        conflict.setPet(pet);
        conflict.setAppointmentDate(date);
        conflict.setStartTime(LocalTime.of(9, 30));
        conflict.setEndTime(LocalTime.of(10, 30));
        conflict.setStatus(AppointmentStatus.CONFIRMED);

        when(appointmentRepository.findConflictingAppointments(
                eq(1L), eq(date), eq(start), eq(end), isNull()))
                .thenReturn(List.of(conflict));

        DuplicateAppointmentException ex = assertThrows(
                DuplicateAppointmentException.class,
                () -> appointmentService.checkGroomerAvailability(1L, date, start, end, null));

        assertTrue(ex.getMessage().contains("ConflictingPet"),
                "Exception message should name the conflicting pet");
    }

    @Test
    @DisplayName("T7 - Non-overlapping slot does not throw")
    void testAvailabilityWhenNoConflict() {
        LocalDate date = LocalDate.of(2026, 10, 15);
        LocalTime start = LocalTime.of(14, 0);
        LocalTime end = LocalTime.of(15, 0);

        when(appointmentRepository.findConflictingAppointments(
                eq(1L), eq(date), eq(start), eq(end), isNull()))
                .thenReturn(List.of());

        assertDoesNotThrow(() -> appointmentService.checkGroomerAvailability(1L, date, start, end, null));
    }
}