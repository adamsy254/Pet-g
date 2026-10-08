package com.petgrooming.salon.dto;

import com.petgrooming.salon.entity.Appointment;
import com.petgrooming.salon.entity.AppointmentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

public class AppointmentDTO {

    private Long id;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private Long petId;
    private String petName;
    private String petSpecies;
    private Long groomerId;
    private String groomerName;
    private LocalDate appointmentDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private AppointmentStatus status;
    private List<GroomingServiceDTO> services;
    private BigDecimal calculatedPrice;
    private String notes;

    public AppointmentDTO() {
    }

    public AppointmentDTO(Appointment app) {
        this.id = app.getId();
        if (app.getCustomer() != null) {
            this.customerId = app.getCustomer().getId();
            this.customerName = app.getCustomer().getFullName();
            this.customerPhone = app.getCustomer().getPhone();
        }
        if (app.getPet() != null) {
            this.petId = app.getPet().getId();
            this.petName = app.getPet().getName();
            this.petSpecies = app.getPet().getSpecies();
        }
        if (app.getGroomer() != null) {
            this.groomerId = app.getGroomer().getId();
            this.groomerName = app.getGroomer().getFullName();
        }
        this.appointmentDate = app.getAppointmentDate();
        this.startTime = app.getStartTime();
        this.endTime = app.getEndTime();
        this.status = app.getStatus();
        this.calculatedPrice = app.getCalculatedPrice();
        this.notes = app.getNotes();
        if (app.getServices() != null) {
            this.services = app.getServices().stream()
                    .map(GroomingServiceDTO::new)
                    .collect(Collectors.toList());
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
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

    public Long getPetId() {
        return petId;
    }

    public void setPetId(Long petId) {
        this.petId = petId;
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

    public Long getGroomerId() {
        return groomerId;
    }

    public void setGroomerId(Long groomerId) {
        this.groomerId = groomerId;
    }

    public String getGroomerName() {
        return groomerName;
    }

    public void setGroomerName(String groomerName) {
        this.groomerName = groomerName;
    }

    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDate appointmentDate) {
        this.appointmentDate = appointmentDate;
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

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }

    public List<GroomingServiceDTO> getServices() {
        return services;
    }

    public void setServices(List<GroomingServiceDTO> services) {
        this.services = services;
    }

    public BigDecimal getCalculatedPrice() {
        return calculatedPrice;
    }

    public void setCalculatedPrice(BigDecimal calculatedPrice) {
        this.calculatedPrice = calculatedPrice;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
