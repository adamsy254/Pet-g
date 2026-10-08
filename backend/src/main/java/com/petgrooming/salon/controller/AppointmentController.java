package com.petgrooming.salon.controller;

import com.petgrooming.salon.dto.AppointmentDTO;
import com.petgrooming.salon.dto.AppointmentRequest;
import com.petgrooming.salon.dto.PriceCalculationRequest;
import com.petgrooming.salon.dto.PriceCalculationResponse;
import com.petgrooming.salon.entity.AppointmentStatus;
import com.petgrooming.salon.service.AppointmentService;
import com.petgrooming.salon.service.PricingService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final PricingService pricingService;

    public AppointmentController(AppointmentService appointmentService, PricingService pricingService) {
        this.appointmentService = appointmentService;
        this.pricingService = pricingService;
    }

    @GetMapping
    public ResponseEntity<List<AppointmentDTO>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDTO> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<AppointmentDTO>> searchAppointments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) Long groomerId,
            @RequestParam(required = false) String query) {
        return ResponseEntity.ok(appointmentService.searchAppointments(date, status, groomerId, query));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByDate(date));
    }

    @PostMapping
    public ResponseEntity<AppointmentDTO> createAppointment(@Valid @RequestBody AppointmentRequest request) {
        AppointmentDTO created = appointmentService.createAppointment(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentDTO> updateAppointment(
            @PathVariable Long id, @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.updateAppointment(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentDTO> updateStatus(
            @PathVariable Long id, @RequestParam AppointmentStatus status) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Dedicated dynamic pricing calculation engine endpoint
     */
    @PostMapping("/pricing/calculate")
    public ResponseEntity<PriceCalculationResponse> calculatePrice(
            @Valid @RequestBody PriceCalculationRequest request) {
        return ResponseEntity.ok(pricingService.calculatePrice(request));
    }
}
