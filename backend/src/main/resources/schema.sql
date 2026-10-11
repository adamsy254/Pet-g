-- Schema definition for Pet Grooming Salon Management System
-- MySQL 8.0+ / Aiven defaultdb

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
                                     id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                     username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'STAFF',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
                                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                         first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(25) NOT NULL,
    address VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- 3. Pets Table (Polymorphic Hierarchy: Dog, Cat, Bird)
CREATE TABLE IF NOT EXISTS pets (
                                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                    pet_type VARCHAR(20) NOT NULL,
    name VARCHAR(50) NOT NULL,
    breed VARCHAR(80) NOT NULL,
    weight DOUBLE NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    medical_conditions TEXT,
    allergies TEXT,
    behavioral_notes TEXT,
    grooming_preferences TEXT,
    customer_id BIGINT NOT NULL,
    coat_type VARCHAR(50),
    requires_handling_muzzle BOOLEAN DEFAULT FALSE,
    indoor_only BOOLEAN DEFAULT TRUE,
    declawed BOOLEAN DEFAULT FALSE,
    matting_severity VARCHAR(50),
    wing_clipping_needed BOOLEAN DEFAULT FALSE,
    beak_condition VARCHAR(50),
    cage_trained BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pets_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
    );

-- 4. Grooming Services Table
CREATE TABLE IF NOT EXISTS grooming_services (
                                                 id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                                 name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    duration_minutes INT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- 5. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
                                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                            customer_id BIGINT NOT NULL,
                                            pet_id BIGINT NOT NULL,
                                            groomer_id BIGINT NOT NULL,
                                            appointment_date DATE NOT NULL,
                                            start_time TIME NOT NULL,
                                            end_time TIME NOT NULL,
                                            status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    calculated_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_app_customer FOREIGN KEY (customer_id) REFERENCES customers (id),
    CONSTRAINT fk_app_pet FOREIGN KEY (pet_id) REFERENCES pets (id),
    CONSTRAINT fk_app_groomer FOREIGN KEY (groomer_id) REFERENCES users (id)
    );

-- 6. Appointment Services (Many-to-Many Join Table)
CREATE TABLE IF NOT EXISTS appointment_services (
                                                    appointment_id BIGINT NOT NULL,
                                                    service_id BIGINT NOT NULL,
                                                    PRIMARY KEY (appointment_id, service_id),
    CONSTRAINT fk_as_appointment FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE CASCADE,
    CONSTRAINT fk_as_service FOREIGN KEY (service_id) REFERENCES grooming_services (id) ON DELETE RESTRICT
    );