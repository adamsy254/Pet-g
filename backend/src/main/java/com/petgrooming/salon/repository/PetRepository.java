package com.petgrooming.salon.repository;

import com.petgrooming.salon.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByCustomerId(Long customerId);

    @Query("SELECT p FROM Pet p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.breed) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.customer.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.customer.lastName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Pet> searchPets(@Param("query") String query);
}
