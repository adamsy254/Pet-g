package com.petgrooming.salon.service;

import com.petgrooming.salon.dto.RegisterRequest;
import com.petgrooming.salon.dto.UserDTO;
import com.petgrooming.salon.entity.Role;
import com.petgrooming.salon.entity.User;
import com.petgrooming.salon.exception.ResourceNotFoundException;
import com.petgrooming.salon.exception.ValidationException;
import com.petgrooming.salon.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getStaffMembers() {
        return userRepository.findAll().stream()
                .filter(User::isEnabled)
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        return new UserDTO(user);
    }

    public UserDTO createUser(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new ValidationException("Username '" + req.getUsername() + "' is already taken.");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ValidationException("Email '" + req.getEmail() + "' is already registered.");
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setRole(req.getRole() != null ? req.getRole() : Role.STAFF);
        user.setEnabled(true);

        User saved = userRepository.save(user);
        return new UserDTO(saved);
    }

    public UserDTO updateUser(Long id, UserDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        if (dto.getRole() != null) {
            user.setRole(dto.getRole());
        }
        user.setEnabled(dto.isEnabled());

        User updated = userRepository.save(user);
        return new UserDTO(updated);
    }

    public void toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
    }
}
