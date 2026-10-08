package com.petgrooming.salon.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pets")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "pet_type", discriminatorType = DiscriminatorType.STRING)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "species")
@JsonSubTypes({
    @JsonSubTypes.Type(value = Dog.class, name = "DOG"),
    @JsonSubTypes.Type(value = Cat.class, name = "CAT"),
    @JsonSubTypes.Type(value = Bird.class, name = "BIRD")
})
public abstract class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Pet name is required")
    @Size(max = 50, message = "Pet name cannot exceed 50 characters")
    @Column(nullable = false, length = 50)
    private String name;

    @NotBlank(message = "Breed is required")
    @Size(max = 80, message = "Breed cannot exceed 80 characters")
    @Column(nullable = false, length = 80)
    private String breed;

    @NotNull(message = "Weight is required")
    @Positive(message = "Weight must be positive")
    @Column(nullable = false)
    private Double weight; // in pounds (lbs)

    @NotNull(message = "Age is required")
    @Positive(message = "Age must be greater than 0")
    @Column(nullable = false)
    private Integer age;

    @NotBlank(message = "Gender is required")
    @Column(nullable = false, length = 10)
    private String gender; // Male / Female

    @Lob
    @Column(name = "medical_conditions", columnDefinition = "TEXT")
    private String medicalConditions;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String allergies;

    @Lob
    @Column(name = "behavioral_notes", columnDefinition = "TEXT")
    private String behavioralNotes;

    @Lob
    @Column(name = "grooming_preferences", columnDefinition = "TEXT")
    private String groomingPreferences;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToMany(mappedBy = "pet", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Appointment> appointments = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Pet() {
    }

    public Pet(String name, String breed, Double weight, Integer age, String gender,
               String medicalConditions, String allergies, String behavioralNotes,
               String groomingPreferences, Customer customer) {
        this.name = name;
        this.breed = breed;
        this.weight = weight;
        this.age = age;
        this.gender = gender;
        this.medicalConditions = medicalConditions;
        this.allergies = allergies;
        this.behavioralNotes = behavioralNotes;
        this.groomingPreferences = groomingPreferences;
        this.customer = customer;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // ==========================================
    // POLYMORPHIC METHODS (Core OOP Requirement)
    // ==========================================
    
    /**
     * Polymorphic method to return species name
     */
    public abstract String getSpecies();

    /**
     * Polymorphic method to calculate species-specific pricing factor
     */
    public abstract double calculateSpeciesMultiplier();

    /**
     * Polymorphic method returning specific handling surcharge (e.g. muzzled, high matting, flighted)
     */
    public abstract double getHandlingSurcharge();

    /**
     * Polymorphic method returning specialized care protocol for groomers
     */
    public abstract String getSpecialCareInstructions();

    // ==========================================
    // Encapsulation - Getters & Setters
    // ==========================================
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

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public List<Appointment> getAppointments() {
        return appointments;
    }

    public void setAppointments(List<Appointment> appointments) {
        this.appointments = appointments;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
