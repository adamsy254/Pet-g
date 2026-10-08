package com.petgrooming.salon.service;

import com.petgrooming.salon.entity.Bird;
import com.petgrooming.salon.entity.Cat;
import com.petgrooming.salon.entity.Dog;
import com.petgrooming.salon.entity.GroomingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Unit tests for the polymorphic pricing engine.
 * Uses calculateVerifiedPrice(Pet, List<GroomingService>) which does not
 * touch the repositories, so no mocks are needed.
 */
class PricingServiceTest {

    private PricingService pricingService;

    private GroomingService fullGroom;
    private GroomingService basicBath;
    private GroomingService avianGroom;

    @BeforeEach
    void setUp() {
        // Repositories are unused by calculateVerifiedPrice; null is safe here.
        pricingService = new PricingService(null, null);

        fullGroom  = new GroomingService("Full Groom Package", "...", new BigDecimal("75.00"), 90, true);
        basicBath  = new GroomingService("Basic Bath & Brush", "...", new BigDecimal("45.00"), 45, true);
        avianGroom = new GroomingService("Avian Talon & Wing Groom", "...", new BigDecimal("32.00"), 30, true);
    }

    @Test
    @DisplayName("T1 - Dog, Double Coat, 65 lbs: 75 * 1.15 * 1.30 = $112.13")
    void testDogDoubleCoatLargeTier() {
        Dog dog = new Dog();
        dog.setWeight(65.0);
        dog.setCoatType("Double Coat");
        dog.setRequiresHandlingMuzzle(false);

        BigDecimal result = pricingService.calculateVerifiedPrice(dog, List.of(fullGroom));

        assertEquals(new BigDecimal("112.13"), result);
    }

    @Test
    @DisplayName("T2 - Cat, SEVERE matting, 11 lbs: 75 * 1.10 * 1.00 + 25 = $107.50")
    void testCatSevereMattingSurcharge() {
        Cat cat = new Cat();
        cat.setWeight(11.2);
        cat.setMattingSeverity("SEVERE");

        BigDecimal result = pricingService.calculateVerifiedPrice(cat, List.of(fullGroom));

        assertEquals(new BigDecimal("107.50"), result);
    }

    @Test
    @DisplayName("T3 - Dog, muzzle required, 26 lbs: 45 * 1.00 * 1.15 + 15 = $66.75")
    void testDogMuzzleSurcharge() {
        Dog dog = new Dog();
        dog.setWeight(26.0);
        dog.setCoatType("Short Smooth");
        dog.setRequiresHandlingMuzzle(true);

        BigDecimal result = pricingService.calculateVerifiedPrice(dog, List.of(basicBath));

        assertEquals(new BigDecimal("66.75"), result);
    }

    @Test
    @DisplayName("T4 - Bird, wing clipping needed, 2.3 lbs: 32 * 0.90 * 1.00 + 10 = $38.80")
    void testBirdWingClippingSurcharge() {
        Bird bird = new Bird();
        bird.setWeight(2.3);
        bird.setWingClippingNeeded(true);
        bird.setBeakCondition("HEALTHY");

        BigDecimal result = pricingService.calculateVerifiedPrice(bird, List.of(avianGroom));

        assertEquals(new BigDecimal("38.80"), result);
    }

    @Test
    @DisplayName("T5 - Dog, giant tier (80 lbs): 45 * 1.00 * 1.50 = $67.50")
    void testGiantTierWeightMultiplier() {
        Dog dog = new Dog();
        dog.setWeight(80.0);
        dog.setCoatType("Short Smooth");
        dog.setRequiresHandlingMuzzle(false);

        BigDecimal result = pricingService.calculateVerifiedPrice(dog, List.of(basicBath));

        assertEquals(new BigDecimal("67.50"), result);
    }
}