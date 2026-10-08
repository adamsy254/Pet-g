package com.petgrooming.salon.repository;

import com.petgrooming.salon.entity.Appointment;
import com.petgrooming.salon.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByAppointmentDateOrderByStartTimeAsc(LocalDate appointmentDate);

    List<Appointment> findByCustomerIdOrderByAppointmentDateDescStartTimeDesc(Long customerId);

    List<Appointment> findByPetIdOrderByAppointmentDateDescStartTimeDesc(Long petId);

    List<Appointment> findByGroomerIdAndAppointmentDate(Long groomerId, LocalDate appointmentDate);

    List<Appointment> findByStatus(AppointmentStatus status);

    List<Appointment> findByAppointmentDateBetween(LocalDate startDate, LocalDate endDate);

    /**
     * CRITICAL: Double-booking overlap prevention query.
     * Finds appointments for the groomer on the specified date where:
     * (existing.startTime < newEndTime) AND (existing.endTime > newStartTime)
     * Excludes CANCELLED appointments and optionally excludes the appointment itself when updating.
     */
    @Query("SELECT a FROM Appointment a WHERE " +
           "a.groomer.id = :groomerId AND " +
           "a.appointmentDate = :appointmentDate AND " +
           "a.status <> 'CANCELLED' AND " +
           "(:excludeAppointmentId IS NULL OR a.id <> :excludeAppointmentId) AND " +
           "(a.startTime < :endTime AND a.endTime > :startTime)")
    List<Appointment> findConflictingAppointments(
            @Param("groomerId") Long groomerId,
            @Param("appointmentDate") LocalDate appointmentDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeAppointmentId") Long excludeAppointmentId
    );

    @Query("SELECT a FROM Appointment a WHERE " +
           "(:date IS NULL OR a.appointmentDate = :date) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:groomerId IS NULL OR a.groomer.id = :groomerId) AND " +
           "(:search IS NULL OR " +
           " LOWER(a.customer.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(a.customer.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(a.pet.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY a.appointmentDate DESC, a.startTime ASC")
    List<Appointment> searchAppointments(
            @Param("date") LocalDate date,
            @Param("status") AppointmentStatus status,
            @Param("groomerId") Long groomerId,
            @Param("search") String search
    );
}
