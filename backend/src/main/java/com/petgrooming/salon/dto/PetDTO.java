package com.petgrooming.salon.dto;

import com.petgrooming.salon.entity.Bird;
import com.petgrooming.salon.entity.Cat;
import com.petgrooming.salon.entity.Dog;
import com.petgrooming.salon.entity.Pet;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class PetDTO {

    private Long id;

    @NotBlank(message = "Species is required (DOG, CAT, BIRD)")
    private String species;

    @NotBlank(message = "Pet name is required")
    private String name;

    @NotBlank(message = "Breed is required")
    private String breed;

    @NotNull(message = "Weight is required")
    @Positive(message = "Weight must be positive")
    private Double weight;

    @NotNull(message = "Age is required")
    @Positive(message = "Age must be greater than 0")
    private Integer age;

    @NotBlank(message = "Gender is required")
    private String gender;

    private String medicalConditions;
    private String allergies;
    private String behavioralNotes;
    private String groomingPreferences;

    @NotNull(message = "Customer ID is required")
    private Long customerId;
    private String customerName;

    // Dog specific
    private String coatType;
    private Boolean requiresHandlingMuzzle;

    // Cat specific
    private Boolean indoorOnly;
    private Boolean declawed;
    private String mattingSeverity;

    // Bird specific
    private Boolean wingClippingNeeded;
    private String beakCondition;
    private Boolean cageTrained;

    // Polymorphic computed attributes
    private Double speciesMultiplier;
    private Double handlingSurcharge;
    private String specialCareInstructions;

    public PetDTO() {
    }

    public PetDTO(Pet pet) {
        this.id = pet.getId();
        this.species = pet.getSpecies();
        this.name = pet.getName();
        this.breed = pet.getBreed();
        this.weight = pet.getWeight();
        this.age = pet.getAge();
        this.gender = pet.getGender();
        this.medicalConditions = pet.getMedicalConditions();
        this.allergies = pet.getAllergies();
        this.behavioralNotes = pet.getBehavioralNotes();
        this.groomingPreferences = pet.getGroomingPreferences();
        if (pet.getCustomer() != null) {
            this.customerId = pet.getCustomer().getId();
            this.customerName = pet.getCustomer().getFullName();
        }

        // Polymorphic evaluation
        this.speciesMultiplier = pet.calculateSpeciesMultiplier();
        this.handlingSurcharge = pet.getHandlingSurcharge();
        this.specialCareInstructions = pet.getSpecialCareInstructions();

        if (pet instanceof Dog dog) {
            this.coatType = dog.getCoatType();
            this.requiresHandlingMuzzle = dog.getRequiresHandlingMuzzle();
        } else if (pet instanceof Cat cat) {
            this.indoorOnly = cat.getIndoorOnly();
            this.declawed = cat.getDeclawed();
            this.mattingSeverity = cat.getMattingSeverity();
        } else if (pet instanceof Bird bird) {
            this.wingClippingNeeded = bird.getWingClippingNeeded();
            this.beakCondition = bird.getBeakCondition();
            this.cageTrained = bird.getCageTrained();
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSpecies() {
        return species;
    }

    public void setSpecies(String species) {
        this.species = species;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBreed() {
        return breed;
    }

    public void setBreed(String breed) {
        this.breed = breed;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getMedicalConditions() {
        return medicalConditions;
    }

    public void setMedicalConditions(String medicalConditions) {
        this.medicalConditions = medicalConditions;
    }

    public String getAllergies() {
        return allergies;
    }

    public void setAllergies(String allergies) {
        this.allergies = allergies;
    }

    public String getBehavioralNotes() {
        return behavioralNotes;
    }

    public void setBehavioralNotes(String behavioralNotes) {
        this.behavioralNotes = behavioralNotes;
    }

    public String getGroomingPreferences() {
        return groomingPreferences;
    }

    public void setGroomingPreferences(String groomingPreferences) {
        this.groomingPreferences = groomingPreferences;
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

    public Double getSpeciesMultiplier() {
        return speciesMultiplier;
    }

    public void setSpeciesMultiplier(Double speciesMultiplier) {
        this.speciesMultiplier = speciesMultiplier;
    }

    public Double getHandlingSurcharge() {
        return handlingSurcharge;
    }

    public void setHandlingSurcharge(Double handlingSurcharge) {
        this.handlingSurcharge = handlingSurcharge;
    }

    public String getSpecialCareInstructions() {
        return specialCareInstructions;
    }

    public void setSpecialCareInstructions(String specialCareInstructions) {
        this.specialCareInstructions = specialCareInstructions;
    }
}
