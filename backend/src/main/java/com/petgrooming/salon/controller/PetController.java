package com.petgrooming.salon.controller;

import com.petgrooming.salon.dto.PetDTO;
import com.petgrooming.salon.service.PetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
public class PetController {

    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    @GetMapping
    public ResponseEntity<List<PetDTO>> getAllPets() {
        return ResponseEntity.ok(petService.getAllPets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PetDTO> getPetById(@PathVariable Long id) {
        return ResponseEntity.ok(petService.getPetById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PetDTO>> searchPets(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(petService.searchPets(query));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<PetDTO>> getPetsByCustomerId(@PathVariable Long customerId) {
        return ResponseEntity.ok(petService.getPetsByCustomerId(customerId));
    }

    @PostMapping
    public ResponseEntity<PetDTO> createPet(@Valid @RequestBody PetDTO dto) {
        PetDTO created = petService.createPet(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PetDTO> updatePet(@PathVariable Long id, @Valid @RequestBody PetDTO dto) {
        return ResponseEntity.ok(petService.updatePet(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePet(@PathVariable Long id) {
        petService.deletePet(id);
        return ResponseEntity.noContent().build();
    }
}
