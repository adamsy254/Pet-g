package com.petgrooming.salon.service;

import com.petgrooming.salon.dto.CustomerDTO;
import com.petgrooming.salon.entity.Customer;
import com.petgrooming.salon.exception.ResourceNotFoundException;
import com.petgrooming.salon.exception.ValidationException;
import com.petgrooming.salon.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerService customerService;

    private Customer sampleCustomer;

    @BeforeEach
    void setUp() {
        sampleCustomer = new Customer("John", "Doe", "john.doe@example.com", "555-111-2222", "123 Main St", "Great customer");
        sampleCustomer.setId(1L);
    }

    @Test
    @DisplayName("Create customer: successful creation saves and returns DTO")
    void testCreateCustomerSuccess() {
        when(customerRepository.existsByEmail("john.doe@example.com")).thenReturn(false);
        when(customerRepository.save(any(Customer.class))).thenReturn(sampleCustomer);

        CustomerDTO dto = new CustomerDTO(sampleCustomer);
        CustomerDTO created = customerService.createCustomer(dto);

        assertNotNull(created);
        assertEquals("John", created.getFirstName());
        assertEquals("john.doe@example.com", created.getEmail());
        verify(customerRepository, times(1)).save(any(Customer.class));
    }

    @Test
    @DisplayName("Create customer: duplicate email throws ValidationException")
    void testCreateCustomerDuplicateEmail() {
        when(customerRepository.existsByEmail("john.doe@example.com")).thenReturn(true);

        CustomerDTO dto = new CustomerDTO(sampleCustomer);
        assertThrows(ValidationException.class, () -> customerService.createCustomer(dto));
        verify(customerRepository, never()).save(any(Customer.class));
    }

    @Test
    @DisplayName("Get customer by ID: returns customer DTO when found")
    void testGetCustomerByIdFound() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(sampleCustomer));

        CustomerDTO found = customerService.getCustomerById(1L);
        assertNotNull(found);
        assertEquals(1L, found.getId());
        assertEquals("John Doe", found.getFullName());
    }

    @Test
    @DisplayName("Get customer by ID: throws ResourceNotFoundException when not found")
    void testGetCustomerByIdNotFound() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> customerService.getCustomerById(99L));
    }

    @Test
    @DisplayName("Delete customer: succeeds when customer exists")
    void testDeleteCustomer() {
        when(customerRepository.existsById(1L)).thenReturn(true);

        customerService.deleteCustomer(1L);
        verify(customerRepository, times(1)).deleteById(1L);
    }
}
