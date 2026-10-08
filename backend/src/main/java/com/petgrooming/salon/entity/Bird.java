package com.petgrooming.salon.entity;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("BIRD")
public class Bird extends Pet {

    @Column(name = "wing_clipping_needed")
    private Boolean wingClippingNeeded = false;

    @Column(name = "beak_condition", length = 50)
    private String beakCondition = "HEALTHY"; // "HEALTHY", "OVERGROWN", "CRACKED"

    @Column(name = "cage_trained")
    private Boolean cageTrained = true;

    public Bird() {
        super();
    }

    public Bird(String name, String breed, Double weight, Integer age, String gender,
                String medicalConditions, String allergies, String behavioralNotes,
                String groomingPreferences, Customer customer, Boolean wingClippingNeeded,
                String beakCondition, Boolean cageTrained) {
        super(name, breed, weight, age, gender, medicalConditions, allergies, behavioralNotes, groomingPreferences, customer);
        this.wingClippingNeeded = wingClippingNeeded != null ? wingClippingNeeded : false;
        this.beakCondition = beakCondition != null ? beakCondition : "HEALTHY";
        this.cageTrained = cageTrained != null ? cageTrained : true;
    }

    @Override
    public String getSpecies() {
        return "BIRD";
    }

    @Override
    public double calculateSpeciesMultiplier() {
        // Avian grooming typically requires specialized precision grip rather than full wash tubs (multiplier 0.90)
        return 0.90;
    }

    @Override
    public double getHandlingSurcharge() {
        double surcharge = 0.0;
        if (Boolean.TRUE.equals(wingClippingNeeded)) {
            surcharge += 10.00;
        }
        if ("OVERGROWN".equalsIgnoreCase(beakCondition)) {
            surcharge += 12.00; // Beak file correction
        }
        return surcharge;
    }

    @Override
    public String getSpecialCareInstructions() {
        StringBuilder sb = new StringBuilder("Avian Care Protocol: ");
        sb.append("Beak Status: ").append(beakCondition != null ? beakCondition : "HEALTHY").append(". ");
        if (Boolean.TRUE.equals(wingClippingNeeded)) {
            sb.append("Require flight feather safety trimming. ");
        }
        sb.append(Boolean.TRUE.equals(cageTrained) ? "Tolerates carrier quietly. " : "Easily startled: keep noise to a minimum.");
        return sb.toString();
    }

    public Boolean getWingClippingNeeded() {
        return wingClippingNeeded;
    }

    public void setWingClippingNeeded(Boolean wingClippingNeeded) {
        this.wingClippingNeeded = wingClippingNeeded;
    }

    public String getBeakCondition() {
        return beakCondition;
    }

    public void setBeakCondition(String beakCondition) {
        this.beakCondition = beakCondition;
    }

    public Boolean getCageTrained() {
        return cageTrained;
    }

    public void setCageTrained(Boolean cageTrained) {
        this.cageTrained = cageTrained;
    }
}
