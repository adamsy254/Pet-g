package com.petgrooming.salon.service;

import com.petgrooming.salon.dto.PriceCalculationRequest;
import com.petgrooming.salon.dto.PriceCalculationResponse;
import com.petgrooming.salon.entity.GroomingService;
import com.petgrooming.salon.entity.Pet;
import com.petgrooming.salon.exception.ResourceNotFoundException;
import com.petgrooming.salon.repository.GroomingServiceRepository;
import com.petgrooming.salon.repository.PetRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class PricingService {

    private final GroomingServiceRepository serviceRepository;
    private final PetRepository petRepository;

    public PricingService(GroomingServiceRepository serviceRepository, PetRepository petRepository) {
        this.serviceRepository = serviceRepository;
        this.petRepository = petRepository;
    }

    /**
     * Calculates the dynamic price based on services, pet species multiplier,
     * weight adjustment tier, and polymorphic special handling surcharges.
     */
    public PriceCalculationResponse calculatePrice(PriceCalculationRequest request) {
        List<GroomingService> services = serviceRepository.findAllById(request.getServiceIds());
        if (services.isEmpty()) {
            throw new ResourceNotFoundException("No valid grooming services selected");
        }

        BigDecimal baseServicesTotal = BigDecimal.ZERO;
        int totalDuration = 0;
        for (GroomingService s : services) {
            baseServicesTotal = baseServicesTotal.add(s.getBasePrice());
            totalDuration += s.getDurationMinutes();
        }

        double speciesMultiplier = 1.0;
        double weightMultiplier = 1.0;
        double handlingSurcharge = 0.0;
        double weight = request.getWeight() != null ? request.getWeight() : 20.0;
        List<String> notes = new ArrayList<>();

        if (request.getPetId() != null) {
            Pet pet = petRepository.findById(request.getPetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Pet not found with ID: " + request.getPetId()));
            weight = pet.getWeight();
            speciesMultiplier = pet.calculateSpeciesMultiplier();
            handlingSurcharge = pet.getHandlingSurcharge();
            notes.add(pet.getSpecies() + " (" + pet.getBreed() + ", " + weight + " lbs)");
            if (handlingSurcharge > 0) {
                notes.add("Handling surcharge: $" + String.format("%.2f", handlingSurcharge));
            }
        } else {
            // Direct request parameter calculation
            String species = request.getSpecies() != null ? request.getSpecies().toUpperCase() : "DOG";
            if ("CAT".equals(species)) {
                speciesMultiplier = 1.10;
                if ("SEVERE".equalsIgnoreCase(request.getMattingSeverity())) {
                    handlingSurcharge += 25.0;
                    notes.add("Severe matting feline surcharge: $25.00");
                }
            } else if ("BIRD".equals(species)) {
                speciesMultiplier = 0.90;
                if (Boolean.TRUE.equals(request.getWingClippingNeeded())) {
                    handlingSurcharge += 10.0;
                    notes.add("Wing flight clipping surcharge: $10.00");
                }
            } else { // DOG
                if ("Double Coat".equalsIgnoreCase(request.getCoatType()) || "Curly/Wire".equalsIgnoreCase(request.getCoatType())) {
                    speciesMultiplier = 1.15;
                    notes.add("Specialized coat labor multiplier: x1.15");
                }
                if (Boolean.TRUE.equals(request.getRequiresHandlingMuzzle())) {
                    handlingSurcharge += 15.0;
                    notes.add("Two-staff safety handling surcharge: $15.00");
                }
            }
        }

        // Weight Tier Multiplier
        if (weight < 15.0) {
            weightMultiplier = 1.00; // Small / Toy
            notes.add("Weight tier: Under 15 lbs (Standard baseline)");
        } else if (weight <= 40.0) {
            weightMultiplier = 1.15; // Medium
            notes.add("Weight tier: 15-40 lbs (+15%)");
        } else if (weight <= 70.0) {
            weightMultiplier = 1.30; // Large
            notes.add("Weight tier: 40-70 lbs (+30%)");
        } else {
            weightMultiplier = 1.50; // Extra Large / Giant
            notes.add("Weight tier: 70+ lbs (+50%)");
        }

        // Formula: (BasePrice * SpeciesMultiplier * WeightMultiplier) + HandlingSurcharge
        BigDecimal adjustedBase = baseServicesTotal
                .multiply(BigDecimal.valueOf(speciesMultiplier))
                .multiply(BigDecimal.valueOf(weightMultiplier))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal weightAdjustment = adjustedBase.subtract(baseServicesTotal);
        BigDecimal surchargeBD = BigDecimal.valueOf(handlingSurcharge).setScale(2, RoundingMode.HALF_UP);
        BigDecimal finalPrice = adjustedBase.add(surchargeBD).setScale(2, RoundingMode.HALF_UP);

        PriceCalculationResponse response = new PriceCalculationResponse();
        response.setBaseServicesTotal(baseServicesTotal.setScale(2, RoundingMode.HALF_UP));
        response.setSpeciesMultiplier(speciesMultiplier);
        response.setWeightMultiplier(weightMultiplier);
        response.setWeightAdjustmentAmount(weightAdjustment);
        response.setHandlingSurcharge(surchargeBD);
        response.setFinalEstimatedPrice(finalPrice);
        response.setTotalDurationMinutes(totalDuration);
        response.setAppliedAdjustments(notes);

        return response;
    }

    /**
     * Compute verified backend price for an appointment entity
     */
    public BigDecimal calculateVerifiedPrice(Pet pet, List<GroomingService> services) {
        BigDecimal base = BigDecimal.ZERO;
        for (GroomingService s : services) {
            base = base.add(s.getBasePrice());
        }

        double speciesFactor = pet.calculateSpeciesMultiplier();
        double weightFactor;
        double w = pet.getWeight();
        if (w < 15.0) {
            weightFactor = 1.00;
        } else if (w <= 40.0) {
            weightFactor = 1.15;
        } else if (w <= 70.0) {
            weightFactor = 1.30;
        } else {
            weightFactor = 1.50;
        }

        double surcharge = pet.getHandlingSurcharge();

        BigDecimal adjusted = base
                .multiply(BigDecimal.valueOf(speciesFactor))
                .multiply(BigDecimal.valueOf(weightFactor))
                .setScale(2, RoundingMode.HALF_UP);

        return adjusted.add(BigDecimal.valueOf(surcharge)).setScale(2, RoundingMode.HALF_UP);
    }
}
