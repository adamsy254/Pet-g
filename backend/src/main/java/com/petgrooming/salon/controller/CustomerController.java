package com.petgrooming.salon.controller;

import com.petgrooming.salon.dto.AppointmentDTO;
import com.petgrooming.salon.dto.CustomerDTO;
import com.petgrooming.salon.dto.PetDTO;
import com.petgrooming.salon.service.AppointmentService;
import com.petgrooming.salon.service.CustomerService;
import com.petgrooming.salon.service.PetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;
    private final PetService petService;
    private final AppointmentService appointmentService;

    public CustomerController(CustomerService customerService,
                              PetService petService,
                              AppointmentService appointmentService) {
        this.customerService = customerService;
        this.petService = petService;
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public ResponseEntity<List<CustomerDTO>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerDTO> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<CustomerDTO>> searchCustomers(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(customerService.searchCustomers(query));
    }

    @PostMapping
    public ResponseEntity<CustomerDTO> createCustomer(@Valid @RequestBody CustomerDTO dto) {
        CustomerDTO created = customerService.createCustomer(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerDTO> updateCustomer(@PathVariable Long id, @Valid @RequestBody CustomerDTO dto) {
        return ResponseEntity.ok(customerService.updateCustomer(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/pets")
    public ResponseEntity<List<PetDTO>> getCustomerPets(@PathVariable Long id) {
        return ResponseEntity.ok(petService.getPetsByCustomerId(id));
    }

    @GetMapping("/{id}/appointments")
    public ResponseEntity<List<AppointmentDTO>> getCustomerAppointments(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentsByCustomer(id));
    }
}
