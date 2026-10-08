package com.petgrooming.salon.controller;

import com.petgrooming.salon.dto.GroomingServiceDTO;
import com.petgrooming.salon.service.GroomingServiceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class GroomingServiceController {

    private final GroomingServiceService serviceService;

    public GroomingServiceController(GroomingServiceService serviceService) {
        this.serviceService = serviceService;
    }

    @GetMapping
    public ResponseEntity<List<GroomingServiceDTO>> getAllServices(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        return ResponseEntity.ok(serviceService.getAllServices(activeOnly));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroomingServiceDTO> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceService.getServiceById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<GroomingServiceDTO>> searchServices(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(serviceService.searchServices(query));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GroomingServiceDTO> createService(@Valid @RequestBody GroomingServiceDTO dto) {
        GroomingServiceDTO created = serviceService.createService(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GroomingServiceDTO> updateService(
            @PathVariable Long id, @Valid @RequestBody GroomingServiceDTO dto) {
        return ResponseEntity.ok(serviceService.updateService(id, dto));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateService(@PathVariable Long id) {
        serviceService.deactivateService(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        serviceService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
