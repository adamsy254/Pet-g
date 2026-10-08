package com.petgrooming.salon.entity;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("DOG")
public class Dog extends Pet {

    @Column(name = "coat_type", length = 50)
    private String coatType; // e.g. "Double Coat", "Short Smooth", "Curly/Wire", "Long Silky"

    @Column(name = "requires_handling_muzzle")
    private Boolean requiresHandlingMuzzle = false;

    public Dog() {
        super();
    }

    public Dog(String name, String breed, Double weight, Integer age, String gender,
               String medicalConditions, String allergies, String behavioralNotes,
               String groomingPreferences, Customer customer, String coatType, Boolean requiresHandlingMuzzle) {
        super(name, breed, weight, age, gender, medicalConditions, allergies, behavioralNotes, groomingPreferences, customer);
        this.coatType = coatType;
        this.requiresHandlingMuzzle = requiresHandlingMuzzle != null ? requiresHandlingMuzzle : false;
    }

    @Override
    public String getSpecies() {
        return "DOG";
    }

    @Override
    public double calculateSpeciesMultiplier() {
        // Standard canine baseline factor is 1.00; thick double coats require additional labor factor
        if ("Double Coat".equalsIgnoreCase(coatType) || "Curly/Wire".equalsIgnoreCase(coatType)) {
            return 1.15;
        }
        return 1.00;
    }

    @Override
    public double getHandlingSurcharge() {
        // Dogs requiring behavioral muzzle handling require two-staff caution
        return Boolean.TRUE.equals(requiresHandlingMuzzle) ? 15.00 : 0.00;
    }

    @Override
    public String getSpecialCareInstructions() {
        StringBuilder sb = new StringBuilder("Canine Care Protocol: ");
        sb.append("Coat Type: ").append(coatType != null ? coatType : "Standard").append(". ");
        if (Boolean.TRUE.equals(requiresHandlingMuzzle)) {
            sb.append("CAUTION: Requires safety muzzle during high-velocity drying and nail trimming. ");
        }
        return sb.toString();
    }

    public String getCoatType() {
        return coatType;
    }

    public void setCoatType(String coatType) {
        this.coatType = coatType;
    }

    public Boolean getRequiresHandlingMuzzle() {
        return requiresHandlingMuzzle;
    }

    public void setRequiresHandlingMuzzle(Boolean requiresHandlingMuzzle) {
        this.requiresHandlingMuzzle = requiresHandlingMuzzle;
    }
}
