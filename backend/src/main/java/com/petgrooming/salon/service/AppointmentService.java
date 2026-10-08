package com.petgrooming.salon.service;

import com.petgrooming.salon.dto.AppointmentDTO;
import com.petgrooming.salon.dto.AppointmentRequest;
import com.petgrooming.salon.entity.*;
import com.petgrooming.salon.exception.DuplicateAppointmentException;
import com.petgrooming.salon.exception.ResourceNotFoundException;
import com.petgrooming.salon.exception.ValidationException;
import com.petgrooming.salon.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final GroomingServiceRepository serviceRepository;
    private final PricingService pricingService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              CustomerRepository customerRepository,
                              PetRepository petRepository,
                              UserRepository userRepository,
                              GroomingServiceRepository serviceRepository,
                              PricingService pricingService) {
        this.appointmentRepository = appointmentRepository;
        this.customerRepository = customerRepository;
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.serviceRepository = serviceRepository;
        this.pricingService = pricingService;
    }

    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AppointmentDTO getAppointmentById(Long id) {
        Appointment app = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
        return new AppointmentDTO(app);
    }

    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDateOrderByStartTimeAsc(date).stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentDTO> searchAppointments(LocalDate date, AppointmentStatus status, Long groomerId, String query) {
        return appointmentRepository.searchAppointments(date, status, groomerId, query).stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentDTO> getAppointmentsByCustomer(Long customerId) {
        return appointmentRepository.findByCustomerIdOrderByAppointmentDateDescStartTimeDesc(customerId).stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Creates an appointment with double-booking prevention and backend price calculation.
     */
    public AppointmentDTO createAppointment(AppointmentRequest req) {
        validateTimes(req);

        // 1. Double-booking check
        checkGroomerAvailability(req.getGroomerId(), req.getAppointmentDate(), req.getStartTime(), req.getEndTime(), null);

        // 2. Fetch Customer
        Customer customer = customerRepository.findById(req.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + req.getCustomerId()));

        // 3. Fetch Pet and verify ownership
        Pet pet = petRepository.findById(req.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with ID: " + req.getPetId()));
        if (!pet.getCustomer().getId().equals(customer.getId())) {
            throw new ValidationException("Selected pet does not belong to the selected customer");
        }

        // 4. Fetch Groomer
        User groomer = userRepository.findById(req.getGroomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Groomer not found with ID: " + req.getGroomerId()));

        // 5. Fetch Services
        List<GroomingService> serviceList = serviceRepository.findAllById(req.getServiceIds());
        if (serviceList.isEmpty()) {
            throw new ValidationException("At least one valid grooming service must be selected");
        }
        Set<GroomingService> serviceSet = new HashSet<>(serviceList);

        // 6. Backend price verification - NEVER trust the client
        BigDecimal calculatedPrice = pricingService.calculateVerifiedPrice(pet, serviceList);

        Appointment appointment = new Appointment();
        appointment.setCustomer(customer);
        appointment.setPet(pet);
        appointment.setGroomer(groomer);
        appointment.setAppointmentDate(req.getAppointmentDate());
        appointment.setStartTime(req.getStartTime());
        appointment.setEndTime(req.getEndTime());
        appointment.setStatus(req.getStatus() != null ? req.getStatus() : AppointmentStatus.SCHEDULED);
        appointment.setServices(serviceSet);
        appointment.setCalculatedPrice(calculatedPrice);
        appointment.setNotes(req.getNotes());

        Appointment saved = appointmentRepository.save(appointment);
        return new AppointmentDTO(saved);
    }

    /**
     * Updates an appointment with double-booking check excluding current appointment ID.
     */
    public AppointmentDTO updateAppointment(Long id, AppointmentRequest req) {
        validateTimes(req);

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));

        // Double-booking check (excluding this appointment)
        checkGroomerAvailability(req.getGroomerId(), req.getAppointmentDate(), req.getStartTime(), req.getEndTime(), id);

        Customer customer = customerRepository.findById(req.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + req.getCustomerId()));

        Pet pet = petRepository.findById(req.getPetId())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with ID: " + req.getPetId()));

        User groomer = userRepository.findById(req.getGroomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Groomer not found with ID: " + req.getGroomerId()));

        List<GroomingService> serviceList = serviceRepository.findAllById(req.getServiceIds());
        if (serviceList.isEmpty()) {
            throw new ValidationException("At least one valid grooming service must be selected");
        }

        BigDecimal calculatedPrice = pricingService.calculateVerifiedPrice(pet, serviceList);

        appointment.setCustomer(customer);
        appointment.setPet(pet);
        appointment.setGroomer(groomer);
        appointment.setAppointmentDate(req.getAppointmentDate());
        appointment.setStartTime(req.getStartTime());
        appointment.setEndTime(req.getEndTime());
        if (req.getStatus() != null) {
            appointment.setStatus(req.getStatus());
        }
        appointment.setServices(new HashSet<>(serviceList));
        appointment.setCalculatedPrice(calculatedPrice);
        appointment.setNotes(req.getNotes());

        Appointment updated = appointmentRepository.save(appointment);
        return new AppointmentDTO(updated);
    }

    public AppointmentDTO updateStatus(Long id, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
        appointment.setStatus(status);
        return new AppointmentDTO(appointmentRepository.save(appointment));
    }

    public void deleteAppointment(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Appointment not found with ID: " + id);
        }
        appointmentRepository.deleteById(id);
    }

    /**
     * Core overlap validation logic ensuring no double bookings.
     */
    public void checkGroomerAvailability(Long groomerId, LocalDate date, java.time.LocalTime startTime, java.time.LocalTime endTime, Long excludeAppointmentId) {
        List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(
                groomerId, date, startTime, endTime, excludeAppointmentId
        );

        if (!conflicts.isEmpty()) {
            Appointment conflict = conflicts.get(0);
            throw new DuplicateAppointmentException(
                    "The selected groomer already has an appointment during this time (" +
                    conflict.getStartTime() + " - " + conflict.getEndTime() + " with " +
                    conflict.getPet().getName() + ")."
            );
        }
    }

    private void validateTimes(AppointmentRequest req) {
        if (req.getStartTime() == null || req.getEndTime() == null) {
            throw new ValidationException("Start time and end time are required");
        }
        if (!req.getEndTime().isAfter(req.getStartTime())) {
            throw new ValidationException("Appointment end time must be strictly after start time");
        }
    }
}
