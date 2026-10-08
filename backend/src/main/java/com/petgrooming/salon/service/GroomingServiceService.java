package com.petgrooming.salon.service;

import com.petgrooming.salon.dto.GroomingServiceDTO;
import com.petgrooming.salon.entity.GroomingService;
import com.petgrooming.salon.exception.ResourceNotFoundException;
import com.petgrooming.salon.repository.GroomingServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class GroomingServiceService {

    private final GroomingServiceRepository serviceRepository;

    public GroomingServiceService(GroomingServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @Transactional(readOnly = true)
    public List<GroomingServiceDTO> getAllServices(boolean activeOnly) {
        List<GroomingService> list = activeOnly ? serviceRepository.findByActiveTrue() : serviceRepository.findAll();
        return list.stream().map(GroomingServiceDTO::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GroomingServiceDTO getServiceById(Long id) {
        GroomingService service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with ID: " + id));
        return new GroomingServiceDTO(service);
    }

    @Transactional(readOnly = true)
    public List<GroomingServiceDTO> searchServices(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllServices(false);
        }
        return serviceRepository.findByNameContainingIgnoreCase(query.trim()).stream()
                .map(GroomingServiceDTO::new)
                .collect(Collectors.toList());
    }

    public GroomingServiceDTO createService(GroomingServiceDTO dto) {
        GroomingService service = new GroomingService(
                dto.getName(),
                dto.getDescription(),
                dto.getBasePrice(),
                dto.getDurationMinutes(),
                dto.isActive()
        );
        GroomingService saved = serviceRepository.save(service);
        return new GroomingServiceDTO(saved);
    }

    public GroomingServiceDTO updateService(Long id, GroomingServiceDTO dto) {
        GroomingService service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with ID: " + id));

        service.setName(dto.getName());
        service.setDescription(dto.getDescription());
        service.setBasePrice(dto.getBasePrice());
        service.setDurationMinutes(dto.getDurationMinutes());
        service.setActive(dto.isActive());

        GroomingService updated = serviceRepository.save(service);
        return new GroomingServiceDTO(updated);
    }

    public void deactivateService(Long id) {
        GroomingService service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with ID: " + id));
        service.setActive(false);
        serviceRepository.save(service);
    }

    public void deleteService(Long id) {
        if (!serviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Service not found with ID: " + id);
        }
        serviceRepository.deleteById(id);
    }
}
