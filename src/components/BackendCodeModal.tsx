import React, { useState } from "react";
import JSZip from "jszip";
import {
  X,
  Download,
  Folder,
  FileCode,
  Check,
  Copy,
  Layers,
  Sparkles,
  ShieldCheck,
  Calendar
} from "lucide-react";

interface BackendCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CodeSnippet {
  id: string;
  title: string;
  category: string;
  filename: string;
  code: string;
}

const SNIPPETS: CodeSnippet[] = [
  {
    id: "pricing-service",
    title: "Polymorphic Pricing Engine",
    category: "Business Logic",
    filename: "backend/src/main/java/com/petgrooming/salon/service/PricingService.java",
    code: `package com.petgrooming.salon.service;

import com.petgrooming.salon.dto.PriceCalculationRequest;
import com.petgrooming.salon.dto.PriceCalculationResponse;
import com.petgrooming.salon.entity.Pet;
import com.petgrooming.salon.entity.GroomingService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class PricingService {

    /**
     * Core Formula: (BasePrice * SpeciesMultiplier * WeightMultiplier) + HandlingSurcharge
     */
    public BigDecimal calculateVerifiedPrice(Pet pet, List<GroomingService> services) {
        BigDecimal baseTotal = services.stream()
                .map(GroomingService::getBasePrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Polymorphic methods on Pet subclasses (Dog, Cat, Bird)
        double speciesMultiplier = pet.calculateSpeciesMultiplier();
        double weightMultiplier = calculateWeightTierMultiplier(pet.getWeight());
        BigDecimal surcharge = pet.getHandlingSurcharge();

        BigDecimal adjusted = baseTotal
                .multiply(BigDecimal.valueOf(speciesMultiplier))
                .multiply(BigDecimal.valueOf(weightMultiplier))
                .setScale(2, RoundingMode.HALF_UP);

        return adjusted.add(surcharge);
    }

    public double calculateWeightTierMultiplier(Double weight) {
        if (weight == null || weight < 15.0) return 1.00; // Small
        if (weight <= 40.0) return 1.15;                  // Medium (+15%)
        if (weight <= 70.0) return 1.30;                  // Large (+30%)
        return 1.50;                                      // Giant (+50%)
    }
}`
  },
  {
    id: "pet-hierarchy",
    title: "Pet Polymorphic Hierarchy (Dog, Cat, Bird)",
    category: "JPA Entities",
    filename: "backend/src/main/java/com/petgrooming/salon/entity/Pet.java",
    code: `package com.petgrooming.salon.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "pets")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "pet_type", discriminatorType = DiscriminatorType.STRING)
public abstract class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String breed;

    @Column(nullable = false)
    private Double weight;

    // Polymorphic behavioral methods
    public abstract String getSpecies();
    public abstract double calculateSpeciesMultiplier();
    public abstract BigDecimal getHandlingSurcharge();
    public abstract String getSpecialCareInstructions();
}

// Dog Subclass
@Entity
@DiscriminatorValue("DOG")
public class Dog extends Pet {
    private String coatType;
    private boolean requiresHandlingMuzzle;

    @Override
    public double calculateSpeciesMultiplier() {
        if ("Double Coat".equalsIgnoreCase(coatType) || "Curly/Wire".equalsIgnoreCase(coatType)) {
            return 1.15; // +15% labor factor
        }
        return 1.00;
    }

    @Override
    public BigDecimal getHandlingSurcharge() {
        return requiresHandlingMuzzle ? new BigDecimal("15.00") : BigDecimal.ZERO;
    }
}

// Cat Subclass
@Entity
@DiscriminatorValue("CAT")
public class Cat extends Pet {
    private boolean indoorOnly;
    private boolean declawed;
    private String mattingSeverity; // NONE, MILD, MODERATE, SEVERE

    @Override
    public double calculateSpeciesMultiplier() {
        return 1.10; // +10% feline specialization
    }

    @Override
    public BigDecimal getHandlingSurcharge() {
        if ("SEVERE".equalsIgnoreCase(mattingSeverity)) return new BigDecimal("25.00");
        if ("MODERATE".equalsIgnoreCase(mattingSeverity)) return new BigDecimal("15.00");
        return BigDecimal.ZERO;
    }
}`
  },
  {
    id: "appointment-service",
    title: "Double-Booking Overlap Prevention",
    category: "Service Layer",
    filename: "backend/src/main/java/com/petgrooming/salon/service/AppointmentService.java",
    code: `package com.petgrooming.salon.service;

import com.petgrooming.salon.entity.Appointment;
import com.petgrooming.salon.exception.DuplicateAppointmentException;
import com.petgrooming.salon.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    /**
     * Strict double booking prevention using interval overlap:
     * (StartTime < ExistingEndTime AND EndTime > ExistingStartTime)
     */
    public void checkGroomerAvailability(Long groomerId, LocalDate date,
                                         LocalTime startTime, LocalTime endTime,
                                         Long excludeAppointmentId) {
        List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(
                groomerId, date, startTime, endTime, excludeAppointmentId
        );

        if (!conflicts.isEmpty()) {
            Appointment conflict = conflicts.get(0);
            throw new DuplicateAppointmentException(
                "The selected groomer already has an appointment during this time (" +
                conflict.getStartTime() + " - " + conflict.getEndTime() + " with " +
                conflict.getPet().getName() + ")."
            );
        }
    }
}`
  },
  {
    id: "security-config",
    title: "JWT & Spring Security Configuration",
    category: "Security & RBAC",
    filename: "backend/src/main/java/com/petgrooming/salon/security/SecurityConfig.java",
    code: `package com.petgrooming.salon.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/reports/revenue/**").hasRole("ADMIN")
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}`
  },
  {
    id: "unit-tests",
    title: "JUnit 5 & Mockito Test Suites",
    category: "Automated Tests",
    filename: "backend/src/test/java/com/petgrooming/salon/service/AppointmentServiceTest.java",
    code: `package com.petgrooming.salon.service;

import com.petgrooming.salon.exception.DuplicateAppointmentException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AppointmentServiceTest {

    @Test
    @DisplayName("Throws DuplicateAppointmentException when groomer is double-booked")
    void testDoubleBookingRejection() {
        // Simulates groomer having overlapping appointment
        assertThrows(DuplicateAppointmentException.class, () -> {
            appointmentService.createAppointment(conflictingRequest);
        });
        verify(appointmentRepository, never()).save(any());
    }
}`
  },
  {
    id: "sql-schema",
    title: "MySQL DDL Schema & Indexes",
    category: "Database",
    filename: "backend/src/main/resources/schema.sql",
    code: `-- Pet Grooming Salon Management System - MySQL DDL
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'STAFF',
    enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS pets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pet_type VARCHAR(20) NOT NULL, -- SINGLE_TABLE Discriminator (DOG, CAT, BIRD)
    name VARCHAR(50) NOT NULL,
    breed VARCHAR(50) NOT NULL,
    weight DOUBLE NOT NULL,
    customer_id BIGINT NOT NULL,
    coat_type VARCHAR(50),
    requires_handling_muzzle BOOLEAN DEFAULT FALSE,
    matting_severity VARCHAR(20) DEFAULT 'NONE',
    wing_clipping_needed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    pet_id BIGINT NOT NULL,
    groomer_id BIGINT NOT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL,
    calculated_price DECIMAL(10, 2) NOT NULL,
    INDEX idx_groomer_date (groomer_id, appointment_date)
);`
  }
];

export const BackendCodeModal: React.FC<BackendCodeModalProps> = ({ isOpen, onClose }) => {
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>("pricing-service");
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentSnippet = SNIPPETS.find(s => s.id === selectedSnippetId) || SNIPPETS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add all backend files
      for (const snippet of SNIPPETS) {
        zip.file(snippet.filename, snippet.code);
      }

      // Add pom.xml
      zip.file(
        "backend/pom.xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.3</version>
    </parent>
    <groupId>com.petgrooming</groupId>
    <artifactId>salon-management-system</artifactId>
    <version>1.0.0</version>
    <name>Pet Grooming Salon Management System</name>
    <properties>
        <java.version>17</java.version>
    </properties>
</project>`
      );

      // Add README
      zip.file(
        "backend/README.md",
        `# Pet Grooming Salon Management System

A Spring Boot 3.2.3 enterprise management system with polymorphic OOP pricing logic, double-booking prevention, and JWT security.

## Requirements
- Java 17+
- Maven 3.8+
- MySQL 8.0+

## Getting Started
\`\`\`bash
mvn clean install
mvn spring-boot:run
\`\`\`
`
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pet-grooming-salon-backend-springboot3.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate zip", err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 text-stone-100 rounded-2xl max-w-5xl w-full p-6 shadow-2xl border border-stone-800 flex flex-col h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-stone-100 text-base">
                Spring Boot 3.2 Architecture & Backend Explorer
              </h2>
              <p className="text-xs text-stone-400">
                Java 17, Polymorphic JPA Entities, Double-Booking Overlap Checker & MySQL Scripts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isZipping ? "Packaging ZIP..." : "Download Full Backend ZIP"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Left sidebar (Snippets list) & Right Code View */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 overflow-hidden">
          {/* File Selector */}
          <div className="bg-stone-950/60 rounded-xl p-2 border border-stone-800/80 overflow-y-auto space-y-1">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider px-2 py-1 block">
              Enterprise Java Modules
            </span>
            {SNIPPETS.map((s) => {
              const isSelected = s.id === selectedSnippetId;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSnippetId(s.id)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex flex-col gap-0.5 ${
                    isSelected
                      ? "bg-teal-950/70 border border-teal-500/40 text-teal-200"
                      : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/40 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-200">{s.title}</span>
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono truncate">{s.filename.split("/").pop()}</span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer Panel */}
          <div className="md:col-span-2 bg-stone-950 rounded-xl border border-stone-800 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-800 bg-stone-900/50">
              <span className="text-xs font-mono text-stone-400 truncate">
                {currentSnippet.filename}
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 p-4 overflow-auto font-mono text-xs text-stone-300 leading-relaxed">
              <pre>
                <code>{currentSnippet.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
