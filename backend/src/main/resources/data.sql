-- Sample Seed Data for Pet Grooming Salon Management System
-- Idempotent: safe to run on every startup (INSERT IGNORE skips existing rows).

-- 1. Users (demo passwords are plain 'password123' — fine for capstone)
INSERT IGNORE INTO users (id, username, email, password, first_name, last_name, role, enabled) VALUES
(1, 'admin', 'admin@petgrooming.com', '{noop}password123', 'David', 'Tanner', 'ADMIN', true),
(2, 'staff', 'staff@petgrooming.com', '{noop}password123', 'Michael', 'Ross', 'STAFF', true),
(3, 'groomer_emily', 'emily@petgrooming.com', '{noop}password123', 'Emily', 'Clark', 'STAFF', true);

-- 2. Customers
INSERT IGNORE INTO customers (id, first_name, last_name, email, phone, address, notes) VALUES
(1, 'Eleanor', 'Vance', 'eleanor.vance@example.com', '555-019-2831', '742 Evergreen Terrace, Springfield', 'Prefers morning appointments. Dogs get excited easily.'),
(2, 'Marcus', 'Sterling', 'marcus.sterling@example.com', '555-014-9922', '1204 Elmwood Ave, Oak Creek', 'Always brings pet treats. Very punctual.'),
(3, 'Sophia', 'Chen', 'sophia.chen@example.com', '555-018-3489', '88 Maple Ridge Way, Fairview', 'Cat requires quiet drying, sensitive ears.'),
(4, 'David', 'Miller', 'david.miller@example.com', '555-017-7731', '350 Sunset Boulevard, Lakewood', 'Owns an Amazon Parrot, needs gentle wing inspection.');

-- 3. Pets (polymorphic: DOG, CAT, BIRD)
INSERT IGNORE INTO pets (id, pet_type, name, breed, weight, age, gender, medical_conditions, allergies, behavioral_notes, grooming_preferences, customer_id, coat_type, requires_handling_muzzle, indoor_only, declawed, matting_severity, wing_clipping_needed, beak_condition, cage_trained) VALUES
(1, 'DOG', 'Barnaby', 'Golden Retriever', 65.5, 4, 'Male', 'Mild hip dysplasia', 'Chicken sensitivity', 'Friendly, loves water', 'Teddy bear cut, lavender scent conditioner', 1, 'Double Coat', false, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'DOG', 'Bella', 'French Bulldog', 26.0, 2, 'Female', 'Sensitive skin', 'Fragrance allergy', 'Calm but snorts when nervous', 'Hypoallergenic oatmeal bath only, wrinkle cleaning', 1, 'Short Smooth', false, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'CAT', 'Milo', 'Persian Longhair', 11.2, 5, 'Male', 'None', 'None', 'Shy with loud noises, gentle handling required', 'Sanitary trim and lion cut for summer', 2, NULL, NULL, true, false, 'MODERATE', NULL, NULL, NULL),
(4, 'CAT', 'Luna', 'Siamese', 8.5, 3, 'Female', 'None', 'None', 'Very vocal, curious and playful', 'Basic bath, ear wash, nail caps application', 3, NULL, NULL, true, false, 'NONE', NULL, NULL, NULL),
(5, 'BIRD', 'Kiwi', 'Blue-and-Gold Macaw', 2.3, 7, 'Male', 'Past respiratory infection', 'Pollen', 'Intelligent, will speak greetings to groomer', 'Feather misting, light wing trim, talons file', 4, NULL, NULL, NULL, NULL, NULL, true, 'HEALTHY', true);

-- 4. Grooming Services
INSERT IGNORE INTO grooming_services (id, name, description, base_price, duration_minutes, active) VALUES
(1, 'Full Groom Package', 'Comprehensive bath, blow-dry, full haircut styling, ear cleaning, and gland expression', 75.00, 90, true),
(2, 'Basic Bath & Brush', 'Hydro-massage bath, blow-out brush, blueberry facial scrub, and light scissor cleanup', 45.00, 45, true),
(3, 'Nail Trim & Paw Balm', 'Nail clipping, precision Dremel rounding, and moisturizing paw pad balm treatment', 18.00, 20, true),
(4, 'Teeth Cleaning & Breath Fresh', 'Enzymatic brush scrubbing and breath freshening antibacterial spray', 15.00, 15, true),
(5, 'De-Shedding Furminator', 'Specialized undercoat deshedding rake with conditioning soak to reduce loose fur up to 80%', 35.00, 40, true),
(6, 'Flea & Tick Defense Soak', 'Natural pesticide-free therapeutic medicated flea wash and soothing skin treatment', 30.00, 30, true),
(7, 'Avian Talon & Wing Groom', 'Gentle avian wing flight trimming, beak filing check, and talon pedicure', 32.00, 30, true);

-- 5. Appointments (dated relative to today so the dashboard shows data)
INSERT IGNORE INTO appointments (id, customer_id, pet_id, groomer_id, appointment_date, start_time, end_time, status, calculated_price, notes) VALUES
(1, 1, 1, 2, CURDATE(), '09:00:00', '10:30:00', 'CONFIRMED', 97.50, 'Barnaby full groom + teeth freshening. Apply oatmeal shampoo.'),
(2, 2, 3, 2, CURDATE(), '11:00:00', '12:30:00', 'SCHEDULED', 82.50, 'Persian lion trim. Customer will wait in lobby.'),
(3, 3, 4, 3, CURDATE(), '10:00:00', '11:00:00', 'IN_PROGRESS', 49.50, 'Bath and ear cleaning for Luna.'),
(4, 4, 5, 3, CURDATE(), '13:00:00', '13:45:00', 'SCHEDULED', 32.00, 'Macaw wing and talon grooming.'),
(5, 1, 2, 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '14:00:00', '15:00:00', 'COMPLETED', 51.75, 'Bella bath completed. Paid in full.');

-- 6. Appointment ↔ Service links
INSERT IGNORE INTO appointment_services (appointment_id, service_id) VALUES
(1, 1),
(1, 4),
(2, 1),
(3, 2),
(4, 7),
(5, 2);