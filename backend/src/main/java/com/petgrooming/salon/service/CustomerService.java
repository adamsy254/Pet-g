package com.petgrooming.salon.service;

import com.petgrooming.salon.dto.CustomerDTO;
import com.petgrooming.salon.entity.Customer;
import com.petgrooming.salon.exception.ResourceNotFoundException;
import com.petgrooming.salon.exception.ValidationException;
import com.petgrooming.salon.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Transactional(readOnly = true)
    public List<CustomerDTO> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(CustomerDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CustomerDTO getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
        return new CustomerDTO(customer);
    }

    @Transactional(readOnly = true)
    public Customer getCustomerEntityById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<CustomerDTO> searchCustomers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllCustomers();
        }
        return customerRepository.searchCustomers(query.trim()).stream()
                .map(CustomerDTO::new)
                .collect(Collectors.toList());
    }

    public CustomerDTO createCustomer(CustomerDTO dto) {
        if (customerRepository.existsByEmail(dto.getEmail())) {
            throw new ValidationException("Customer with email '" + dto.getEmail() + "' already exists.");
        }

        Customer customer = new Customer(
                dto.getFirstName(),
                dto.getLastName(),
                dto.getEmail(),
                dto.getPhone(),
                dto.getAddress(),
                dto.getNotes()
        );

        Customer saved = customerRepository.save(customer);
        return new CustomerDTO(saved);
    }

    public CustomerDTO updateCustomer(Long id, CustomerDTO dto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));

        // If email changed, ensure no collision
        if (!customer.getEmail().equalsIgnoreCase(dto.getEmail()) &&
                customerRepository.existsByEmail(dto.getEmail())) {
            throw new ValidationException("Email '" + dto.getEmail() + "' is already in use by another customer.");
        }

        customer.setFirstName(dto.getFirstName());
        customer.setLastName(dto.getLastName());
        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());
        customer.setAddress(dto.getAddress());
        customer.setNotes(dto.getNotes());

        Customer updated = customerRepository.save(customer);
        return new CustomerDTO(updated);
    }

    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer not found with ID: " + id);
        }
        customerRepository.deleteById(id);
    }
}
