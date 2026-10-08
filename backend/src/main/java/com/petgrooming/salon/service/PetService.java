package com.petgrooming.salon.service;

import com.petgrooming.salon.dto.PetDTO;
import com.petgrooming.salon.entity.*;
import com.petgrooming.salon.exception.ResourceNotFoundException;
import com.petgrooming.salon.exception.ValidationException;
import com.petgrooming.salon.repository.CustomerRepository;
import com.petgrooming.salon.repository.PetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PetService {

    private final PetRepository petRepository;
    private final CustomerRepository customerRepository;

    public PetService(PetRepository petRepository, CustomerRepository customerRepository) {
        this.petRepository = petRepository;
        this.customerRepository = customerRepository;
    }

    @Transactional(readOnly = true)
    public List<PetDTO> getAllPets() {
        return petRepository.findAll().stream()
                .map(PetDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PetDTO getPetById(Long id) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with ID: " + id));
        return new PetDTO(pet);
    }

    @Transactional(readOnly = true)
    public Pet getPetEntityById(Long id) {
        return petRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<PetDTO> getPetsByCustomerId(Long customerId) {
        return petRepository.findByCustomerId(customerId).stream()
                .map(PetDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PetDTO> searchPets(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllPets();
        }
        return petRepository.searchPets(query.trim()).stream()
                .map(PetDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Polymorphic pet creation based on discriminator species
     */
    public PetDTO createPet(PetDTO dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + dto.getCustomerId()));

        String species = dto.getSpecies() != null ? dto.getSpecies().toUpperCase().trim() : "";
        Pet pet;

        switch (species) {
            case "DOG" -> {
                Dog dog = new Dog();
                dog.setCoatType(dto.getCoatType() != null ? dto.getCoatType() : "Standard");
                dog.setRequiresHandlingMuzzle(Boolean.TRUE.equals(dto.getRequiresHandlingMuzzle()));
                pet = dog;
            }
            case "CAT" -> {
                Cat cat = new Cat();
                cat.setIndoorOnly(dto.getIndoorOnly() != null ? dto.getIndoorOnly() : true);
                cat.setDeclawed(Boolean.TRUE.equals(dto.getDeclawed()));
                cat.setMattingSeverity(dto.getMattingSeverity() != null ? dto.getMattingSeverity() : "NONE");
                pet = cat;
            }
            case "BIRD" -> {
                Bird bird = new Bird();
                bird.setWingClippingNeeded(Boolean.TRUE.equals(dto.getWingClippingNeeded()));
                bird.setBeakCondition(dto.getBeakCondition() != null ? dto.getBeakCondition() : "HEALTHY");
                bird.setCageTrained(dto.getCageTrained() != null ? dto.getCageTrained() : true);
                pet = bird;
            }
            default -> throw new ValidationException("Unsupported pet species: '" + dto.getSpecies() + "'. Allowed: DOG, CAT, BIRD");
        }

        pet.setName(dto.getName());
        pet.setBreed(dto.getBreed());
        pet.setWeight(dto.getWeight());
        pet.setAge(dto.getAge());
        pet.setGender(dto.getGender());
        pet.setMedicalConditions(dto.getMedicalConditions());
        pet.setAllergies(dto.getAllergies());
        pet.setBehavioralNotes(dto.getBehavioralNotes());
        pet.setGroomingPreferences(dto.getGroomingPreferences());
        pet.setCustomer(customer);

        Pet saved = petRepository.save(pet);
        return new PetDTO(saved);
    }

    public PetDTO updatePet(Long id, PetDTO dto) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with ID: " + id));

        pet.setName(dto.getName());
        pet.setBreed(dto.getBreed());
        pet.setWeight(dto.getWeight());
        pet.setAge(dto.getAge());
        pet.setGender(dto.getGender());
        pet.setMedicalConditions(dto.getMedicalConditions());
        pet.setAllergies(dto.getAllergies());
        pet.setBehavioralNotes(dto.getBehavioralNotes());
        pet.setGroomingPreferences(dto.getGroomingPreferences());

        if (dto.getCustomerId() != null && !dto.getCustomerId().equals(pet.getCustomer().getId())) {
            Customer customer = customerRepository.findById(dto.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + dto.getCustomerId()));
            pet.setCustomer(customer);
        }

        // Subclass-specific updates
        if (pet instanceof Dog dog) {
            if (dto.getCoatType() != null) dog.setCoatType(dto.getCoatType());
            if (dto.getRequiresHandlingMuzzle() != null) dog.setRequiresHandlingMuzzle(dto.getRequiresHandlingMuzzle());
        } else if (pet instanceof Cat cat) {
            if (dto.getIndoorOnly() != null) cat.setIndoorOnly(dto.getIndoorOnly());
            if (dto.getDeclawed() != null) cat.setDeclawed(dto.getDeclawed());
            if (dto.getMattingSeverity() != null) cat.setMattingSeverity(dto.getMattingSeverity());
        } else if (pet instanceof Bird bird) {
            if (dto.getWingClippingNeeded() != null) bird.setWingClippingNeeded(dto.getWingClippingNeeded());
            if (dto.getBeakCondition() != null) bird.setBeakCondition(dto.getBeakCondition());
            if (dto.getCageTrained() != null) bird.setCageTrained(dto.getCageTrained());
        }

        Pet updated = petRepository.save(pet);
        return new PetDTO(updated);
    }

    public void deletePet(Long id) {
        if (!petRepository.existsById(id)) {
            throw new ResourceNotFoundException("Pet not found with ID: " + id);
        }
        petRepository.deleteById(id);
    }
}
