package com.petgrooming.salon.entity;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("CAT")
public class Cat extends Pet {

    @Column(name = "indoor_only")
    private Boolean indoorOnly = true;

    @Column(name = "declawed")
    private Boolean declawed = false;

    @Column(name = "matting_severity", length = 50)
    private String mattingSeverity = "NONE"; // "NONE", "MILD", "MODERATE", "SEVERE"

    public Cat() {
        super();
    }

    public Cat(String name, String breed, Double weight, Integer age, String gender,
               String medicalConditions, String allergies, String behavioralNotes,
               String groomingPreferences, Customer customer, Boolean indoorOnly,
               Boolean declawed, String mattingSeverity) {
        super(name, breed, weight, age, gender, medicalConditions, allergies, behavioralNotes, groomingPreferences, customer);
        this.indoorOnly = indoorOnly != null ? indoorOnly : true;
        this.declawed = declawed != null ? declawed : false;
        this.mattingSeverity = mattingSeverity != null ? mattingSeverity : "NONE";
    }

    @Override
    public String getSpecies() {
        return "CAT";
    }

    @Override
    public double calculateSpeciesMultiplier() {
        // Cats require specialized quiet low-stress feline grooming protocols (+10% baseline)
        return 1.10;
    }

    @Override
    public double getHandlingSurcharge() {
        // Dematting fees for felines due to thin skin sensitivity
        if ("SEVERE".equalsIgnoreCase(mattingSeverity)) {
            return 25.00;
        } else if ("MODERATE".equalsIgnoreCase(mattingSeverity)) {
            return 15.00;
        } else if ("MILD".equalsIgnoreCase(mattingSeverity)) {
            return 7.50;
        }
        return 0.00;
    }

    @Override
    public String getSpecialCareInstructions() {
        StringBuilder sb = new StringBuilder("Feline Care Protocol: ");
        sb.append(Boolean.TRUE.equals(indoorOnly) ? "Indoor pet (sensitive to unfamiliar scents). " : "Outdoor pet (flea check required). ");
        if (!Boolean.TRUE.equals(declawed)) {
            sb.append("Intact claws: maintain secure towel wraps or cat muzzle during bath. ");
        }
        sb.append("Matting Level: ").append(mattingSeverity != null ? mattingSeverity : "NONE").append(".");
        return sb.toString();
    }

    public Boolean getIndoorOnly() {
        return indoorOnly;
    }

    public void setIndoorOnly(Boolean indoorOnly) {
        this.indoorOnly = indoorOnly;
    }

    public Boolean getDeclawed() {
        return declawed;
    }

    public void setDeclawed(Boolean declawed) {
        this.declawed = declawed;
    }

    public String getMattingSeverity() {
        return mattingSeverity;
    }

    public void setMattingSeverity(String mattingSeverity) {
        this.mattingSeverity = mattingSeverity;
    }
}
