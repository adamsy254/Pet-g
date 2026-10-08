package com.petgrooming.salon.dto;

import java.math.BigDecimal;
import java.util.List;

public class PriceCalculationResponse {

    private BigDecimal baseServicesTotal;
    private double weightMultiplier;
    private double speciesMultiplier;
    private BigDecimal weightAdjustmentAmount;
    private BigDecimal handlingSurcharge;
    private BigDecimal finalEstimatedPrice;
    private Integer totalDurationMinutes;
    private List<String> appliedAdjustments;

    public PriceCalculationResponse() {
    }

    public BigDecimal getBaseServicesTotal() {
        return baseServicesTotal;
    }

    public void setBaseServicesTotal(BigDecimal baseServicesTotal) {
        this.baseServicesTotal = baseServicesTotal;
    }

    public double getWeightMultiplier() {
        return weightMultiplier;
    }

    public void setWeightMultiplier(double weightMultiplier) {
        this.weightMultiplier = weightMultiplier;
    }

    public double getSpeciesMultiplier() {
        return speciesMultiplier;
    }

    public void setSpeciesMultiplier(double speciesMultiplier) {
        this.speciesMultiplier = speciesMultiplier;
    }

    public BigDecimal getWeightAdjustmentAmount() {
        return weightAdjustmentAmount;
    }

    public void setWeightAdjustmentAmount(BigDecimal weightAdjustmentAmount) {
        this.weightAdjustmentAmount = weightAdjustmentAmount;
    }

    public BigDecimal getHandlingSurcharge() {
        return handlingSurcharge;
    }

    public void setHandlingSurcharge(BigDecimal handlingSurcharge) {
        this.handlingSurcharge = handlingSurcharge;
    }

    public BigDecimal getFinalEstimatedPrice() {
        return finalEstimatedPrice;
    }

    public void setFinalEstimatedPrice(BigDecimal finalEstimatedPrice) {
        this.finalEstimatedPrice = finalEstimatedPrice;
    }

    public Integer getTotalDurationMinutes() {
        return totalDurationMinutes;
    }

    public void setTotalDurationMinutes(Integer totalDurationMinutes) {
        this.totalDurationMinutes = totalDurationMinutes;
    }

    public List<String> getAppliedAdjustments() {
        return appliedAdjustments;
    }

    public void setAppliedAdjustments(List<String> appliedAdjustments) {
        this.appliedAdjustments = appliedAdjustments;
    }
}
