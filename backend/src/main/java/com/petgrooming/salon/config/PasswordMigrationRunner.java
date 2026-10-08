package com.petgrooming.salon.config;

import com.petgrooming.salon.entity.User;
import com.petgrooming.salon.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * One-time migration: any user whose password still starts with "{noop}"
 * (a plaintext demo seed) is re-hashed with BCrypt on application startup.
 * After the first run, the stored value becomes "{bcrypt}$2a$10$...".
 *
 * Runs transparently on every boot; does nothing once migration is complete.
 */
@Component
public class PasswordMigrationRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(PasswordMigrationRunner.class);
    private static final String NOOP_PREFIX = "{noop}";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordMigrationRunner(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        List<User> allUsers = userRepository.findAll();
        int migrated = 0;

        for (User user : allUsers) {
            String stored = user.getPassword();
            if (stored != null && stored.startsWith(NOOP_PREFIX)) {
                String plaintext = stored.substring(NOOP_PREFIX.length());
                user.setPassword(passwordEncoder.encode(plaintext));
                userRepository.save(user);
                migrated++;
                log.info("Re-hashed plaintext password for user '{}' using BCrypt", user.getUsername());
            }
        }

        if (migrated > 0) {
            log.info("Password migration complete: {} user(s) upgraded to BCrypt", migrated);
        }
    }
}