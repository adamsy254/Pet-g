package com.petgrooming.salon.dto;

import com.petgrooming.salon.entity.GroomingService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public class GroomingServiceDTO {

    private Long id;

    @NotBlank(message = "Service name is required")
    private String name;

    private String description;

    @NotNull(message = "Base price is required")
    @Positive(message = "Base price must be positive")
    private BigDecimal basePrice;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be greater than 0")
    private Integer durationMinutes;

    private boolean active = true;

    public GroomingServiceDTO() {
    }

    public GroomingServiceDTO(GroomingService service) {
        this.id = service.getId();
        this.name = service.getName();
        this.description = service.getDescription();
        this.basePrice = service.getBasePrice();
        this.durationMinutes = service.getDurationMinutes();
        this.active = service.isActive();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
