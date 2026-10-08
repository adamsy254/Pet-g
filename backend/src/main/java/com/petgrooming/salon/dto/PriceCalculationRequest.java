package com.petgrooming.salon.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class PriceCalculationRequest {

    private Long petId;
    private String species;
    private Double weight;
    private String coatType;
    private String mattingSeverity;
    private Boolean requiresHandlingMuzzle;
    private Boolean wingClippingNeeded;

    @NotEmpty(message = "At least one service must be selected")
    private List<Long> serviceIds;

    public PriceCalculationRequest() {
    }

    public Long getPetId() {
        return petId;
    }

    public void setPetId(Long petId) {
        this.petId = petId;
    }

    public String getSpecies() {
        return species;
    }

    public void setSpecies(String species) {
        this.species = species;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public String getCoatType() {
        return coatType;
    }

    public void setCoatType(String coatType) {
        this.coatType = coatType;
    }

    public String getMattingSeverity() {
        return mattingSeverity;
    }

    public void setMattingSeverity(String mattingSeverity) {
        this.mattingSeverity = mattingSeverity;
    }

    public Boolean getRequiresHandlingMuzzle() {
        return requiresHandlingMuzzle;
    }

    public void setRequiresHandlingMuzzle(Boolean requiresHandlingMuzzle) {
        this.requiresHandlingMuzzle = requiresHandlingMuzzle;
    }

    public Boolean getWingClippingNeeded() {
        return wingClippingNeeded;
    }

    public void setWingClippingNeeded(Boolean wingClippingNeeded) {
        this.wingClippingNeeded = wingClippingNeeded;
    }

    public List<Long> getServiceIds() {
        return serviceIds;
    }

    public void setServiceIds(List<Long> serviceIds) {
        this.serviceIds = serviceIds;
    }
}
