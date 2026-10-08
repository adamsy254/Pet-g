package com.petgrooming.salon.service;

import com.petgrooming.salon.dto.RegisterRequest;
import com.petgrooming.salon.dto.UserDTO;
import com.petgrooming.salon.entity.Role;
import com.petgrooming.salon.entity.User;
import com.petgrooming.salon.exception.ValidationException;
import com.petgrooming.salon.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder);
    }

    private RegisterRequest buildRequest(String username, String email) {
        RegisterRequest req = new RegisterRequest();
        req.setUsername(username);
        req.setEmail(email);
        req.setPassword("password123");
        req.setFirstName("New");
        req.setLastName("User");
        req.setRole(Role.STAFF);
        return req;
    }

    @Test
    @DisplayName("T8 - Duplicate username throws ValidationException")
    void testDuplicateUsernameRejected() {
        RegisterRequest req = buildRequest("admin", "new@example.com");
        when(userRepository.existsByUsername("admin")).thenReturn(true);

        assertThrows(ValidationException.class, () -> userService.createUser(req));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("T9 - Duplicate email throws ValidationException")
    void testDuplicateEmailRejected() {
        RegisterRequest req = buildRequest("newuser", "admin@petgrooming.com");
        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("admin@petgrooming.com")).thenReturn(true);

        assertThrows(ValidationException.class, () -> userService.createUser(req));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("T10 - Password is hashed before saving")
    void testPasswordIsHashed() {
        RegisterRequest req = buildRequest("newuser", "new@example.com");
        req.setPassword("plainTextPassword");

        when(userRepository.existsByUsername("newuser")).thenReturn(false);
        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("plainTextPassword")).thenReturn("$2a$hashedvalue");

        User saved = new User();
        saved.setId(10L);
        saved.setUsername("newuser");
        saved.setEmail("new@example.com");
        saved.setPassword("$2a$hashedvalue");
        saved.setFirstName("New");
        saved.setLastName("User");
        saved.setRole(Role.STAFF);

        when(userRepository.save(any(User.class))).thenReturn(saved);

        UserDTO result = userService.createUser(req);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());

        assertEquals("$2a$hashedvalue", captor.getValue().getPassword(),
                "Plaintext password must never be persisted");
        assertEquals("newuser", result.getUsername());
    }
}