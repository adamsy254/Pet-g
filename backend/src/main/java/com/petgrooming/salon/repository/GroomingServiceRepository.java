package com.petgrooming.salon.repository;

import com.petgrooming.salon.entity.GroomingService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroomingServiceRepository extends JpaRepository<GroomingService, Long> {
    List<GroomingService> findByActiveTrue();
    List<GroomingService> findByNameContainingIgnoreCase(String name);
}
