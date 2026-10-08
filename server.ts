import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface UserRecord {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "STAFF";
  enabled: boolean;
}

interface CustomerRecord {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface PetRecord {
  id: number;
  species: "DOG" | "CAT" | "BIRD";
  name: string;
  breed: string;
  weight: number;
  age: number;
  gender: string;
  medicalConditions: string;
  allergies: string;
  behavioralNotes: string;
  groomingPreferences: string;
  customerId: number;
  // Subclass fields
  coatType?: string;
  requiresHandlingMuzzle?: boolean;
  indoorOnly?: boolean;
  declawed?: boolean;
  mattingSeverity?: string;
  wingClippingNeeded?: boolean;
  beakCondition?: string;
  cageTrained?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GroomingServiceRecord {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  durationMinutes: number;
  active: boolean;
}

interface AppointmentRecord {
  id: number;
  customerId: number;
  petId: number;
  groomerId: number;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  status: "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  serviceIds: number[];
  calculatedPrice: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// -------------------------------------------------------------
// In-Memory Database matching schema.sql and data.sql
// -------------------------------------------------------------
const users: UserRecord[] = [
  {
    id: 1,
    username: "admin",
    email: "david.tanner@petgrooming.com",
    passwordHash: "password123", // In dev/demo environment plain check or simulated BCrypt
    firstName: "David",
    lastName: "Tanner",
    role: "ADMIN",
    enabled: true
  },
  {
    id: 2,
    username: "staff",
    email: "staff@petgrooming.com",
    passwordHash: "password123",
    firstName: "Michael",
    lastName: "Ross",
    role: "STAFF",
    enabled: true
  },
  {
    id: 3,
    username: "groomer_emily",
    email: "emily@petgrooming.com",
    passwordHash: "password123",
    firstName: "Emily",
    lastName: "Clark",
    role: "STAFF",
    enabled: true
  }
];

const customers: CustomerRecord[] = [
  {
    id: 1,
    firstName: "Eleanor",
    lastName: "Vance",
    email: "eleanor.vance@example.com",
    phone: "555-019-2831",
    address: "742 Evergreen Terrace, Springfield",
    notes: "Prefers morning appointments. Dogs get excited easily.",
    createdAt: "2026-08-10T09:00:00Z",
    updatedAt: "2026-09-01T10:00:00Z"
  },
  {
    id: 2,
    firstName: "Marcus",
    lastName: "Sterling",
    email: "marcus.sterling@example.com",
    phone: "555-014-9922",
    address: "1204 Elmwood Ave, Oak Creek",
    notes: "Always brings pet treats. Very punctual.",
    createdAt: "2026-08-15T11:00:00Z",
    updatedAt: "2026-09-02T12:00:00Z"
  },
  {
    id: 3,
    firstName: "Sophia",
    lastName: "Chen",
    email: "sophia.chen@example.com",
    phone: "555-018-3489",
    address: "88 Maple Ridge Way, Fairview",
    notes: "Cat requires quiet drying, sensitive ears.",
    createdAt: "2026-08-20T14:00:00Z",
    updatedAt: "2026-09-05T08:30:00Z"
  },
  {
    id: 4,
    firstName: "David",
    lastName: "Miller",
    email: "david.miller@example.com",
    phone: "555-017-7731",
    address: "350 Sunset Boulevard, Lakewood",
    notes: "Owns an Amazon Parrot, needs gentle wing inspection.",
    createdAt: "2026-08-25T16:00:00Z",
    updatedAt: "2026-09-06T15:00:00Z"
  }
];

const pets: PetRecord[] = [
  {
    id: 1,
    species: "DOG",
    name: "Barnaby",
    breed: "Golden Retriever",
    weight: 65.5,
    age: 4,
    gender: "Male",
    medicalConditions: "Mild hip dysplasia",
    allergies: "Chicken sensitivity",
    behavioralNotes: "Friendly, loves water",
    groomingPreferences: "Teddy bear cut, lavender scent conditioner",
    customerId: 1,
    coatType: "Double Coat",
    requiresHandlingMuzzle: false,
    createdAt: "2026-08-10T09:15:00Z",
    updatedAt: "2026-09-01T10:00:00Z"
  },
  {
    id: 2,
    species: "DOG",
    name: "Bella",
    breed: "French Bulldog",
    weight: 26.0,
    age: 2,
    gender: "Female",
    medicalConditions: "Sensitive skin",
    allergies: "Fragrance allergy",
    behavioralNotes: "Calm but snorts when nervous",
    groomingPreferences: "Hypoallergenic oatmeal bath only, wrinkle cleaning",
    customerId: 1,
    coatType: "Short Smooth",
    requiresHandlingMuzzle: false,
    createdAt: "2026-08-10T09:30:00Z",
    updatedAt: "2026-09-01T10:00:00Z"
  },
  {
    id: 3,
    species: "CAT",
    name: "Milo",
    breed: "Persian Longhair",
    weight: 11.2,
    age: 5,
    gender: "Male",
    medicalConditions: "None",
    allergies: "None",
    behavioralNotes: "Shy with loud noises, gentle handling required",
    groomingPreferences: "Sanitary trim and lion cut for summer",
    customerId: 2,
    indoorOnly: true,
    declawed: false,
    mattingSeverity: "MODERATE",
    createdAt: "2026-08-15T11:15:00Z",
    updatedAt: "2026-09-02T12:00:00Z"
  },
  {
    id: 4,
    species: "CAT",
    name: "Luna",
    breed: "Siamese",
    weight: 8.5,
    age: 3,
    gender: "Female",
    medicalConditions: "None",
    allergies: "None",
    behavioralNotes: "Very vocal, curious and playful",
    groomingPreferences: "Basic bath, ear wash, nail caps application",
    customerId: 3,
    indoorOnly: true,
    declawed: false,
    mattingSeverity: "NONE",
    createdAt: "2026-08-20T14:10:00Z",
    updatedAt: "2026-09-05T08:30:00Z"
  },
  {
    id: 5,
    species: "BIRD",
    name: "Kiwi",
    breed: "Blue-and-Gold Macaw",
    weight: 2.3,
    age: 7,
    gender: "Male",
    medicalConditions: "Past respiratory infection",
    allergies: "Pollen",
    behavioralNotes: "Intelligent, will speak greetings to groomer",
    groomingPreferences: "Feather misting, light wing trim, talons file",
    customerId: 4,
    wingClippingNeeded: true,
    beakCondition: "HEALTHY",
    cageTrained: true,
    createdAt: "2026-08-25T16:20:00Z",
    updatedAt: "2026-09-06T15:00:00Z"
  }
];

const groomingServices: GroomingServiceRecord[] = [
  {
    id: 1,
    name: "Full Groom Package",
    description: "Comprehensive bath, blow-dry, full haircut styling, ear cleaning, and gland expression",
    basePrice: 75.0,
    durationMinutes: 90,
    active: true
  },
  {
    id: 2,
    name: "Basic Bath & Brush",
    description: "Hydro-massage bath, blow-out brush, blueberry facial scrub, and light scissor cleanup",
    basePrice: 45.0,
    durationMinutes: 45,
    active: true
  },
  {
    id: 3,
    name: "Nail Trim & Paw Balm",
    description: "Nail clipping, precision Dremel rounding, and moisturizing paw pad balm treatment",
    basePrice: 18.0,
    durationMinutes: 20,
    active: true
  },
  {
    id: 4,
    name: "Teeth Cleaning & Breath Fresh",
    description: "Enzymatic brush scrubbing and breath freshening antibacterial spray",
    basePrice: 15.0,
    durationMinutes: 15,
    active: true
  },
  {
    id: 5,
    name: "De-Shedding Furminator",
    description: "Specialized undercoat deshedding rake with conditioning soak to reduce loose fur up to 80%",
    basePrice: 35.0,
    durationMinutes: 40,
    active: true
  },
  {
    id: 6,
    name: "Flea & Tick Defense Soak",
    description: "Natural pesticide-free therapeutic medicated flea wash and soothing skin treatment",
    basePrice: 30.0,
    durationMinutes: 30,
    active: true
  },
  {
    id: 7,
    name: "Avian Talon & Wing Groom",
    description: "Gentle avian wing flight trimming, beak filing check, and talon pedicure",
    basePrice: 32.0,
    durationMinutes: 30,
    active: true
  }
];

const appointments: AppointmentRecord[] = [
  {
    id: 1,
    customerId: 1,
    petId: 1,
    groomerId: 2,
    appointmentDate: "2026-09-15",
    startTime: "09:00:00",
    endTime: "10:30:00",
    status: "CONFIRMED",
    serviceIds: [1, 4],
    calculatedPrice: 97.5,
    notes: "Barnaby full groom + teeth freshening. Apply oatmeal shampoo.",
    createdAt: "2026-09-08T10:00:00Z",
    updatedAt: "2026-09-08T10:00:00Z"
  },
  {
    id: 2,
    customerId: 2,
    petId: 3,
    groomerId: 2,
    appointmentDate: "2026-09-15",
    startTime: "11:00:00",
    endTime: "12:30:00",
    status: "SCHEDULED",
    serviceIds: [1],
    calculatedPrice: 82.5,
    notes: "Persian lion trim. Customer will wait in lobby.",
    createdAt: "2026-09-09T11:00:00Z",
    updatedAt: "2026-09-09T11:00:00Z"
  },
  {
    id: 3,
    customerId: 3,
    petId: 4,
    groomerId: 3,
    appointmentDate: "2026-09-15",
    startTime: "10:00:00",
    endTime: "11:00:00",
    status: "IN_PROGRESS",
    serviceIds: [2],
    calculatedPrice: 49.5,
    notes: "Bath and ear cleaning for Luna.",
    createdAt: "2026-09-10T09:30:00Z",
    updatedAt: "2026-09-13T10:00:00Z"
  },
  {
    id: 4,
    customerId: 4,
    petId: 5,
    groomerId: 3,
    appointmentDate: "2026-09-15",
    startTime: "13:00:00",
    endTime: "13:45:00",
    status: "SCHEDULED",
    serviceIds: [7],
    calculatedPrice: 32.0,
    notes: "Macaw wing and talon grooming.",
    createdAt: "2026-09-10T14:00:00Z",
    updatedAt: "2026-09-10T14:00:00Z"
  },
  {
    id: 5,
    customerId: 1,
    petId: 2,
    groomerId: 2,
    appointmentDate: "2026-09-14",
    startTime: "14:00:00",
    endTime: "15:00:00",
    status: "COMPLETED",
    serviceIds: [2],
    calculatedPrice: 51.75,
    notes: "Bella bath completed. Paid in full.",
    createdAt: "2026-09-07T12:00:00Z",
    updatedAt: "2026-09-14T15:05:00Z"
  }
];

let nextUserId = 10;
let nextCustomerId = 10;
let nextPetId = 10;
let nextServiceId = 10;
let nextAppointmentId = 10;

// -------------------------------------------------------------
// Pricing Engine Calculation Logic
// -------------------------------------------------------------
function calculateDynamicPrice(params: {
  petId?: number;
  species?: string;
  weight?: number;
  coatType?: string;
  mattingSeverity?: string;
  requiresHandlingMuzzle?: boolean;
  wingClippingNeeded?: boolean;
  serviceIds: number[];
}) {
  const selectedServices = groomingServices.filter(s => params.serviceIds.includes(s.id));
  const baseServicesTotal = selectedServices.reduce((sum, s) => sum + s.basePrice, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);

  let weight = params.weight ?? 20;
  let speciesMultiplier = 1.0;
  let weightMultiplier = 1.0;
  let handlingSurcharge = 0;
  const appliedAdjustments: string[] = [];

  if (params.petId) {
    const pet = pets.find(p => p.id === params.petId);
    if (pet) {
      weight = pet.weight;
      if (pet.species === "DOG") {
        if (pet.coatType === "Double Coat" || pet.coatType === "Curly/Wire") {
          speciesMultiplier = 1.15;
          appliedAdjustments.push("Double/Curly coat labor factor (x1.15)");
        }
        if (pet.requiresHandlingMuzzle) {
          handlingSurcharge += 15.0;
          appliedAdjustments.push("Safety muzzle handling surcharge ($15.00)");
        }
      } else if (pet.species === "CAT") {
        speciesMultiplier = 1.10;
        appliedAdjustments.push("Feline specialized handling factor (x1.10)");
        if (pet.mattingSeverity === "SEVERE") {
          handlingSurcharge += 25.0;
          appliedAdjustments.push("Severe feline matting dematting fee ($25.00)");
        } else if (pet.mattingSeverity === "MODERATE") {
          handlingSurcharge += 15.0;
          appliedAdjustments.push("Moderate matting fee ($15.00)");
        }
      } else if (pet.species === "BIRD") {
        speciesMultiplier = 0.90;
        appliedAdjustments.push("Avian base factor (x0.90)");
        if (pet.wingClippingNeeded) {
          handlingSurcharge += 10.0;
          appliedAdjustments.push("Avian flight feather safety trim ($10.00)");
        }
      }
    }
  } else {
    const species = (params.species || "DOG").toUpperCase();
    if (species === "CAT") {
      speciesMultiplier = 1.10;
      if (params.mattingSeverity === "SEVERE") handlingSurcharge += 25;
      else if (params.mattingSeverity === "MODERATE") handlingSurcharge += 15;
    } else if (species === "BIRD") {
      speciesMultiplier = 0.90;
      if (params.wingClippingNeeded) handlingSurcharge += 10;
    } else {
      if (params.coatType === "Double Coat" || params.coatType === "Curly/Wire") speciesMultiplier = 1.15;
      if (params.requiresHandlingMuzzle) handlingSurcharge += 15;
    }
  }

  // Weight tier adjustment
  if (weight < 15.0) {
    weightMultiplier = 1.00;
    appliedAdjustments.push("Small tier (<15 lbs): 1.0x baseline");
  } else if (weight <= 40.0) {
    weightMultiplier = 1.15;
    appliedAdjustments.push("Medium tier (15-40 lbs): +15%");
  } else if (weight <= 70.0) {
    weightMultiplier = 1.30;
    appliedAdjustments.push("Large tier (40-70 lbs): +30%");
  } else {
    weightMultiplier = 1.50;
    appliedAdjustments.push("Giant tier (70+ lbs): +50%");
  }

  const adjustedBase = Math.round(baseServicesTotal * speciesMultiplier * weightMultiplier * 100) / 100;
  const weightAdjustmentAmount = Math.round((adjustedBase - baseServicesTotal) * 100) / 100;
  const finalEstimatedPrice = Math.round((adjustedBase + handlingSurcharge) * 100) / 100;

  return {
    baseServicesTotal: Math.round(baseServicesTotal * 100) / 100,
    weightMultiplier,
    speciesMultiplier,
    weightAdjustmentAmount,
    handlingSurcharge: Math.round(handlingSurcharge * 100) / 100,
    finalEstimatedPrice,
    totalDurationMinutes: totalDuration,
    appliedAdjustments
  };
}

// -------------------------------------------------------------
// Double-Booking Overlap Checker
// -------------------------------------------------------------
function hasOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  // Format "HH:mm:ss" or "HH:mm"
  const s1 = start1.length === 5 ? `${start1}:00` : start1;
  const e1 = end1.length === 5 ? `${end1}:00` : end1;
  const s2 = start2.length === 5 ? `${start2}:00` : start2;
  const e2 = end2.length === 5 ? `${end2}:00` : end2;

  return s1 < e2 && e1 > s2;
}

function checkDoubleBooking(
  groomerId: number,
  date: string,
  startTime: string,
  endTime: string,
  excludeId?: number
): AppointmentRecord | undefined {
  return appointments.find(a => {
    if (excludeId && a.id === excludeId) return false;
    if (a.groomerId !== groomerId) return false;
    if (a.appointmentDate !== date) return false;
    if (a.status === "CANCELLED") return false;
    return hasOverlap(startTime, endTime, a.startTime, a.endTime);
  });
}

function formatAppointment(a: AppointmentRecord) {
  const customer = customers.find(c => c.id === a.customerId);
  const pet = pets.find(p => p.id === a.petId);
  const groomer = users.find(u => u.id === a.groomerId);
  const services = groomingServices.filter(s => a.serviceIds.includes(s.id));

  return {
    id: a.id,
    customerId: a.customerId,
    customerName: customer ? `${customer.firstName} ${customer.lastName}` : "Unknown Customer",
    customerPhone: customer ? customer.phone : "",
    petId: a.petId,
    petName: pet ? pet.name : "Unknown Pet",
    petSpecies: pet ? pet.species : "DOG",
    groomerId: a.groomerId,
    groomerName: groomer ? `${groomer.firstName} ${groomer.lastName}` : "Unknown Groomer",
    appointmentDate: a.appointmentDate,
    startTime: a.startTime,
    endTime: a.endTime,
    status: a.status,
    services,
    calculatedPrice: a.calculatedPrice,
    notes: a.notes
  };
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  app.get("/api/health", (req: Request, res: Response) => {
    return res.json({ status: "ok", app: "Pet Grooming Salon Management System" });
  });

  // -----------------------------------------------------------
  // AUTH API
  // -----------------------------------------------------------
  app.post("/api/auth/login", (req: Request, res: Response) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username || u.email === username);
    if (!user || user.passwordHash !== password) {
      return res.status(401).json({
        timestamp: new Date().toISOString(),
        status: 401,
        error: "Unauthorized",
        message: "Invalid username or password"
      });
    }

    if (!user.enabled) {
      return res.status(403).json({
        timestamp: new Date().toISOString(),
        status: 403,
        error: "Forbidden",
        message: "Account is disabled. Contact administrator."
      });
    }

    const token = `jwt_token_${user.role.toLowerCase()}_${user.id}_${Date.now()}`;
    return res.json({
      token,
      type: "Bearer",
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
  });

  app.post("/api/auth/register", (req: Request, res: Response) => {
    const { username, email, password, firstName, lastName, role } = req.body;
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: "Bad Request",
        message: "All fields are required"
      });
    }

    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: "Validation Error",
        message: `Username '${username}' is already taken.`
      });
    }

    const newUser: UserRecord = {
      id: nextUserId++,
      username,
      email,
      passwordHash: password,
      firstName,
      lastName,
      role: role === "ADMIN" ? "ADMIN" : "STAFF",
      enabled: true
    };
    users.push(newUser);

    return res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      fullName: `${newUser.firstName} ${newUser.lastName}`,
      role: newUser.role,
      enabled: newUser.enabled
    });
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    // Default demo session fallback to admin if none passed
    const authHeader = req.headers.authorization;
    let user = users[0];
    if (authHeader && authHeader.includes("staff")) {
      user = users[1];
    }
    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      role: user.role,
      enabled: user.enabled
    });
  });

  // -----------------------------------------------------------
  // USERS API
  // -----------------------------------------------------------
  app.get("/api/users", (req: Request, res: Response) => {
    return res.json(users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      fullName: `${u.firstName} ${u.lastName}`,
      role: u.role,
      enabled: u.enabled
    })));
  });

  app.get("/api/users/staff", (req: Request, res: Response) => {
    return res.json(users.filter(u => u.enabled).map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      fullName: `${u.firstName} ${u.lastName}`,
      role: u.role,
      enabled: u.enabled
    })));
  });

  app.patch("/api/users/:id/toggle-status", (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const user = users.find(u => u.id === id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.enabled = !user.enabled;
    return res.sendStatus(204);
  });

  app.delete("/api/users/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return res.status(404).json({ message: "User not found" });
    const userToDelete = users[idx];
    if (userToDelete.username === "admin") {
      return res.status(400).json({ message: "Primary administrator account cannot be deleted." });
    }
    users.splice(idx, 1);
    return res.sendStatus(204);
  });

  // -----------------------------------------------------------
  // CUSTOMERS API
  // -----------------------------------------------------------
  app.get("/api/customers", (req: Request, res: Response) => {
    const result = customers.map(c => {
      const petCount = pets.filter(p => p.customerId === c.id).length;
      const appointmentCount = appointments.filter(a => a.customerId === c.id).length;
      return {
        ...c,
        fullName: `${c.firstName} ${c.lastName}`,
        petCount,
        appointmentCount
      };
    });
    return res.json(result);
  });

  app.get("/api/customers/search", (req: Request, res: Response) => {
    const query = (req.query.query as string || "").toLowerCase();
    const filtered = customers.filter(c =>
      c.firstName.toLowerCase().includes(query) ||
      c.lastName.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.phone.includes(query)
    );
    const result = filtered.map(c => {
      const petCount = pets.filter(p => p.customerId === c.id).length;
      const appointmentCount = appointments.filter(a => a.customerId === c.id).length;
      return {
        ...c,
        fullName: `${c.firstName} ${c.lastName}`,
        petCount,
        appointmentCount
      };
    });
    return res.json(result);
  });

  app.get("/api/customers/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const customer = customers.find(c => c.id === id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const petCount = pets.filter(p => p.customerId === customer.id).length;
    const appointmentCount = appointments.filter(a => a.customerId === customer.id).length;

    return res.json({
      ...customer,
      fullName: `${customer.firstName} ${customer.lastName}`,
      petCount,
      appointmentCount
    });
  });

  app.post("/api/customers", (req: Request, res: Response) => {
    const { firstName, lastName, email, phone, address, notes } = req.body;
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ message: "First name, last name, email, and phone are required" });
    }

    if (customers.some(c => c.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ message: `Customer with email '${email}' already exists.` });
    }

    const newCustomer: CustomerRecord = {
      id: nextCustomerId++,
      firstName,
      lastName,
      email,
      phone,
      address: address || "",
      notes: notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    customers.push(newCustomer);
    return res.status(201).json({
      ...newCustomer,
      fullName: `${newCustomer.firstName} ${newCustomer.lastName}`,
      petCount: 0,
      appointmentCount: 0
    });
  });

  app.put("/api/customers/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const customer = customers.find(c => c.id === id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const { firstName, lastName, email, phone, address, notes } = req.body;
    if (email && email.toLowerCase() !== customer.email.toLowerCase()) {
      if (customers.some(c => c.id !== id && c.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ message: `Email '${email}' is already in use.` });
      }
    }

    customer.firstName = firstName || customer.firstName;
    customer.lastName = lastName || customer.lastName;
    customer.email = email || customer.email;
    customer.phone = phone || customer.phone;
    customer.address = address !== undefined ? address : customer.address;
    customer.notes = notes !== undefined ? notes : customer.notes;
    customer.updatedAt = new Date().toISOString();

    const petCount = pets.filter(p => p.customerId === customer.id).length;
    const appointmentCount = appointments.filter(a => a.customerId === customer.id).length;

    return res.json({
      ...customer,
      fullName: `${customer.firstName} ${customer.lastName}`,
      petCount,
      appointmentCount
    });
  });

  app.delete("/api/customers/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const index = customers.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ message: "Customer not found" });
    customers.splice(index, 1);
    // Delete associated pets
    for (let i = pets.length - 1; i >= 0; i--) {
      if (pets[i].customerId === id) pets.splice(i, 1);
    }
    return res.sendStatus(204);
  });

  // -----------------------------------------------------------
  // PETS API (Polymorphic details)
  // -----------------------------------------------------------
  function formatPet(p: PetRecord) {
    const customer = customers.find(c => c.id === p.customerId);
    let speciesMultiplier = 1.0;
    let handlingSurcharge = 0;
    let specialCareInstructions = "";

    if (p.species === "DOG") {
      if (p.coatType === "Double Coat" || p.coatType === "Curly/Wire") speciesMultiplier = 1.15;
      if (p.requiresHandlingMuzzle) handlingSurcharge = 15.0;
      specialCareInstructions = `Canine Care Protocol: Coat type ${p.coatType || "Standard"}. ${p.requiresHandlingMuzzle ? "Requires safety muzzle during high-velocity drying." : "Standard gentle handling."}`;
    } else if (p.species === "CAT") {
      speciesMultiplier = 1.10;
      if (p.mattingSeverity === "SEVERE") handlingSurcharge = 25.0;
      else if (p.mattingSeverity === "MODERATE") handlingSurcharge = 15.0;
      else if (p.mattingSeverity === "MILD") handlingSurcharge = 7.5;
      specialCareInstructions = `Feline Care Protocol: ${p.indoorOnly ? "Indoor pet." : "Outdoor pet."} Matting level: ${p.mattingSeverity || "NONE"}. ${p.declawed ? "Declawed." : "Intact claws: secure towel hold."}`;
    } else if (p.species === "BIRD") {
      speciesMultiplier = 0.90;
      if (p.wingClippingNeeded) handlingSurcharge += 10.0;
      if (p.beakCondition === "OVERGROWN") handlingSurcharge += 12.0;
      specialCareInstructions = `Avian Protocol: Beak: ${p.beakCondition || "HEALTHY"}. ${p.wingClippingNeeded ? "Requires flight wing trimming." : "Wings intact."}`;
    }

    return {
      ...p,
      customerName: customer ? `${customer.firstName} ${customer.lastName}` : "Unknown",
      speciesMultiplier,
      handlingSurcharge,
      specialCareInstructions
    };
  }

  app.get("/api/pets", (req: Request, res: Response) => {
    return res.json(pets.map(formatPet));
  });

  app.get("/api/pets/search", (req: Request, res: Response) => {
    const query = (req.query.query as string || "").toLowerCase();
    const filtered = pets.filter(p => {
      const cust = customers.find(c => c.id === p.customerId);
      const custName = cust ? `${cust.firstName} ${cust.lastName}`.toLowerCase() : "";
      return (
        p.name.toLowerCase().includes(query) ||
        p.breed.toLowerCase().includes(query) ||
        p.species.toLowerCase().includes(query) ||
        custName.includes(query)
      );
    });
    return res.json(filtered.map(formatPet));
  });

  app.get("/api/pets/customer/:customerId", (req: Request, res: Response) => {
    const customerId = parseInt(req.params.customerId, 10);
    const custPets = pets.filter(p => p.customerId === customerId);
    return res.json(custPets.map(formatPet));
  });

  app.get("/api/pets/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const pet = pets.find(p => p.id === id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    return res.json(formatPet(pet));
  });

  app.post("/api/pets", (req: Request, res: Response) => {
    const {
      species, name, breed, weight, age, gender,
      medicalConditions, allergies, behavioralNotes, groomingPreferences,
      customerId, coatType, requiresHandlingMuzzle, indoorOnly,
      declawed, mattingSeverity, wingClippingNeeded, beakCondition, cageTrained
    } = req.body;

    if (!species || !name || !breed || !weight || !age || !gender || !customerId) {
      return res.status(400).json({ message: "Missing required pet fields" });
    }

    const newPet: PetRecord = {
      id: nextPetId++,
      species: species.toUpperCase() as "DOG" | "CAT" | "BIRD",
      name,
      breed,
      weight: parseFloat(weight),
      age: parseInt(age, 10),
      gender,
      medicalConditions: medicalConditions || "None",
      allergies: allergies || "None",
      behavioralNotes: behavioralNotes || "",
      groomingPreferences: groomingPreferences || "",
      customerId: parseInt(customerId, 10),
      coatType: coatType || "Standard",
      requiresHandlingMuzzle: Boolean(requiresHandlingMuzzle),
      indoorOnly: indoorOnly !== undefined ? Boolean(indoorOnly) : true,
      declawed: Boolean(declawed),
      mattingSeverity: mattingSeverity || "NONE",
      wingClippingNeeded: Boolean(wingClippingNeeded),
      beakCondition: beakCondition || "HEALTHY",
      cageTrained: cageTrained !== undefined ? Boolean(cageTrained) : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    pets.push(newPet);
    return res.status(201).json(formatPet(newPet));
  });

  app.put("/api/pets/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const pet = pets.find(p => p.id === id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    const b = req.body;
    pet.name = b.name || pet.name;
    pet.breed = b.breed || pet.breed;
    if (b.weight) pet.weight = parseFloat(b.weight);
    if (b.age) pet.age = parseInt(b.age, 10);
    pet.gender = b.gender || pet.gender;
    pet.medicalConditions = b.medicalConditions !== undefined ? b.medicalConditions : pet.medicalConditions;
    pet.allergies = b.allergies !== undefined ? b.allergies : pet.allergies;
    pet.behavioralNotes = b.behavioralNotes !== undefined ? b.behavioralNotes : pet.behavioralNotes;
    pet.groomingPreferences = b.groomingPreferences !== undefined ? b.groomingPreferences : pet.groomingPreferences;
    if (b.customerId) pet.customerId = parseInt(b.customerId, 10);

    // Subclass fields
    if (b.coatType !== undefined) pet.coatType = b.coatType;
    if (b.requiresHandlingMuzzle !== undefined) pet.requiresHandlingMuzzle = Boolean(b.requiresHandlingMuzzle);
    if (b.indoorOnly !== undefined) pet.indoorOnly = Boolean(b.indoorOnly);
    if (b.declawed !== undefined) pet.declawed = Boolean(b.declawed);
    if (b.mattingSeverity !== undefined) pet.mattingSeverity = b.mattingSeverity;
    if (b.wingClippingNeeded !== undefined) pet.wingClippingNeeded = Boolean(b.wingClippingNeeded);
    if (b.beakCondition !== undefined) pet.beakCondition = b.beakCondition;
    if (b.cageTrained !== undefined) pet.cageTrained = Boolean(b.cageTrained);
    pet.updatedAt = new Date().toISOString();

    return res.json(formatPet(pet));
  });

  app.delete("/api/pets/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const index = pets.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ message: "Pet not found" });
    pets.splice(index, 1);
    return res.sendStatus(204);
  });

  // -----------------------------------------------------------
  // SERVICES API
  // -----------------------------------------------------------
  app.get("/api/services", (req: Request, res: Response) => {
    const activeOnly = req.query.activeOnly === "true";
    const result = activeOnly ? groomingServices.filter(s => s.active) : groomingServices;
    return res.json(result);
  });

  app.get("/api/services/search", (req: Request, res: Response) => {
    const query = (req.query.query as string || "").toLowerCase();
    const result = groomingServices.filter(s => s.name.toLowerCase().includes(query));
    return res.json(result);
  });

  app.post("/api/services", (req: Request, res: Response) => {
    const { name, description, basePrice, durationMinutes, active } = req.body;
    if (!name || basePrice === undefined || durationMinutes === undefined) {
      return res.status(400).json({ message: "Name, price, and duration are required" });
    }
    const newService: GroomingServiceRecord = {
      id: nextServiceId++,
      name,
      description: description || "",
      basePrice: parseFloat(basePrice),
      durationMinutes: parseInt(durationMinutes, 10),
      active: active !== undefined ? Boolean(active) : true
    };
    groomingServices.push(newService);
    return res.status(201).json(newService);
  });

  app.put("/api/services/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const s = groomingServices.find(srv => srv.id === id);
    if (!s) return res.status(404).json({ message: "Service not found" });

    const b = req.body;
    s.name = b.name || s.name;
    s.description = b.description !== undefined ? b.description : s.description;
    if (b.basePrice !== undefined) s.basePrice = parseFloat(b.basePrice);
    if (b.durationMinutes !== undefined) s.durationMinutes = parseInt(b.durationMinutes, 10);
    if (b.active !== undefined) s.active = Boolean(b.active);

    return res.json(s);
  });

  app.patch("/api/services/:id/deactivate", (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const s = groomingServices.find(srv => srv.id === id);
    if (!s) return res.status(404).json({ message: "Service not found" });
    s.active = false;
    return res.sendStatus(204);
  });

  app.delete("/api/services/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const index = groomingServices.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ message: "Service not found" });
    groomingServices.splice(index, 1);
    return res.sendStatus(204);
  });

  // -----------------------------------------------------------
  // APPOINTMENTS API (With double booking check & dynamic pricing)
  // -----------------------------------------------------------
  app.get("/api/appointments", (req: Request, res: Response) => {
    return res.json(appointments.map(formatAppointment));
  });

  app.get("/api/appointments/search", (req: Request, res: Response) => {
    const date = req.query.date as string;
    const status = req.query.status as string;
    const groomerId = req.query.groomerId ? parseInt(req.query.groomerId as string, 10) : null;
    const query = (req.query.query as string || "").toLowerCase();

    let list = appointments.slice();
    if (date) list = list.filter(a => a.appointmentDate === date);
    if (status) list = list.filter(a => a.status === status);
    if (groomerId) list = list.filter(a => a.groomerId === groomerId);
    if (query) {
      list = list.filter(a => {
        const cust = customers.find(c => c.id === a.customerId);
        const pet = pets.find(p => p.id === a.petId);
        const cName = cust ? `${cust.firstName} ${cust.lastName}`.toLowerCase() : "";
        const pName = pet ? pet.name.toLowerCase() : "";
        return cName.includes(query) || pName.includes(query);
      });
    }

    return res.json(list.map(formatAppointment));
  });

  app.get("/api/appointments/date/:date", (req: Request, res: Response) => {
    const date = req.params.date;
    const list = appointments.filter(a => a.appointmentDate === date);
    return res.json(list.map(formatAppointment));
  });

  app.get("/api/appointments/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const appt = appointments.find(a => a.id === id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });
    return res.json(formatAppointment(appt));
  });

  app.post("/api/appointments/pricing/calculate", (req: Request, res: Response) => {
    const { petId, species, weight, coatType, mattingSeverity, requiresHandlingMuzzle, wingClippingNeeded, serviceIds } = req.body;
    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.status(400).json({ message: "At least one service must be selected" });
    }

    const calculation = calculateDynamicPrice({
      petId: petId ? parseInt(petId, 10) : undefined,
      species,
      weight: weight ? parseFloat(weight) : undefined,
      coatType,
      mattingSeverity,
      requiresHandlingMuzzle: Boolean(requiresHandlingMuzzle),
      wingClippingNeeded: Boolean(wingClippingNeeded),
      serviceIds
    });

    return res.json(calculation);
  });

  app.post("/api/appointments", (req: Request, res: Response) => {
    const { customerId, petId, groomerId, appointmentDate, startTime, endTime, status, serviceIds, notes } = req.body;

    if (!customerId || !petId || !groomerId || !appointmentDate || !startTime || !endTime || !serviceIds || serviceIds.length === 0) {
      return res.status(400).json({ message: "All required appointment fields must be provided" });
    }

    // Format times
    const start = startTime.length === 5 ? `${startTime}:00` : startTime;
    const end = endTime.length === 5 ? `${endTime}:00` : endTime;

    if (end <= start) {
      return res.status(400).json({ message: "Appointment end time must be strictly after start time" });
    }

    // CRITICAL: Double-booking prevention check!
    const conflict = checkDoubleBooking(parseInt(groomerId, 10), appointmentDate, start, end);
    if (conflict) {
      const conflictingPet = pets.find(p => p.id === conflict.petId);
      const petName = conflictingPet ? conflictingPet.name : "another pet";
      return res.status(409).json({
        timestamp: new Date().toISOString(),
        status: 409,
        error: "Appointment Conflict",
        message: `The selected groomer already has an appointment during this time (${conflict.startTime.substring(0, 5)} - ${conflict.endTime.substring(0, 5)} with ${petName}).`
      });
    }

    // Backend verified price calculation
    const pricing = calculateDynamicPrice({
      petId: parseInt(petId, 10),
      serviceIds: serviceIds.map((id: any) => parseInt(id, 10))
    });

    const newAppt: AppointmentRecord = {
      id: nextAppointmentId++,
      customerId: parseInt(customerId, 10),
      petId: parseInt(petId, 10),
      groomerId: parseInt(groomerId, 10),
      appointmentDate,
      startTime: start,
      endTime: end,
      status: status || "SCHEDULED",
      serviceIds: serviceIds.map((id: any) => parseInt(id, 10)),
      calculatedPrice: pricing.finalEstimatedPrice,
      notes: notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    appointments.push(newAppt);
    return res.status(201).json(formatAppointment(newAppt));
  });

  app.put("/api/appointments/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const appt = appointments.find(a => a.id === id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    const { customerId, petId, groomerId, appointmentDate, startTime, endTime, status, serviceIds, notes } = req.body;

    const start = startTime ? (startTime.length === 5 ? `${startTime}:00` : startTime) : appt.startTime;
    const end = endTime ? (endTime.length === 5 ? `${endTime}:00` : endTime) : appt.endTime;
    const date = appointmentDate || appt.appointmentDate;
    const groomer = groomerId ? parseInt(groomerId, 10) : appt.groomerId;

    if (end <= start) {
      return res.status(400).json({ message: "Appointment end time must be strictly after start time" });
    }

    // Overlap prevention excluding self
    const conflict = checkDoubleBooking(groomer, date, start, end, id);
    if (conflict) {
      const conflictingPet = pets.find(p => p.id === conflict.petId);
      const petName = conflictingPet ? conflictingPet.name : "another pet";
      return res.status(409).json({
        timestamp: new Date().toISOString(),
        status: 409,
        error: "Appointment Conflict",
        message: `The selected groomer already has an appointment during this time (${conflict.startTime.substring(0, 5)} - ${conflict.endTime.substring(0, 5)} with ${petName}).`
      });
    }

    if (customerId) appt.customerId = parseInt(customerId, 10);
    if (petId) appt.petId = parseInt(petId, 10);
    appt.groomerId = groomer;
    appt.appointmentDate = date;
    appt.startTime = start;
    appt.endTime = end;
    if (status) appt.status = status;
    if (serviceIds) appt.serviceIds = serviceIds.map((sid: any) => parseInt(sid, 10));
    if (notes !== undefined) appt.notes = notes;

    // Recalculate price
    const pricing = calculateDynamicPrice({
      petId: appt.petId,
      serviceIds: appt.serviceIds
    });
    appt.calculatedPrice = pricing.finalEstimatedPrice;
    appt.updatedAt = new Date().toISOString();

    return res.json(formatAppointment(appt));
  });

  app.patch("/api/appointments/:id/status", (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const appt = appointments.find(a => a.id === id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    const { status } = req.query;
    if (!status) return res.status(400).json({ message: "Status is required" });

    appt.status = status as any;
    appt.updatedAt = new Date().toISOString();
    return res.json(formatAppointment(appt));
  });

  app.delete("/api/appointments/:id", (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) return res.status(404).json({ message: "Appointment not found" });
    appointments.splice(index, 1);
    return res.sendStatus(204);
  });

  // -----------------------------------------------------------
  // REPORTS API
  // -----------------------------------------------------------
  app.get("/api/reports/daily", (req: Request, res: Response) => {
    const targetDate = (req.query.date as string) || "2026-09-15";
    const dayApps = appointments.filter(a => a.appointmentDate === targetDate);

    let expectedRevenue = 0;
    const items = dayApps.map(a => {
      const c = customers.find(cust => cust.id === a.customerId);
      const p = pets.find(pet => pet.id === a.petId);
      const g = users.find(u => u.id === a.groomerId);
      const sNames = groomingServices.filter(s => a.serviceIds.includes(s.id)).map(s => s.name);

      if (a.status === "COMPLETED" || a.status === "CONFIRMED" || a.status === "SCHEDULED") {
        expectedRevenue += a.calculatedPrice;
      }

      return {
        appointmentId: a.id,
        startTime: a.startTime,
        endTime: a.endTime,
        customerName: c ? `${c.firstName} ${c.lastName}` : "Unknown",
        customerPhone: c ? c.phone : "",
        petName: p ? p.name : "Unknown",
        petSpecies: p ? p.species : "DOG",
        groomerName: g ? `${g.firstName} ${g.lastName}` : "Unknown",
        services: sNames,
        status: a.status,
        price: a.calculatedPrice
      };
    });

    return res.json({
      date: targetDate,
      items,
      totalAppointments: items.length,
      expectedRevenue: Math.round(expectedRevenue * 100) / 100
    });
  });

  app.get("/api/reports/revenue", (req: Request, res: Response) => {
    const month = (req.query.month as string) || "2026-09";
    const monthApps = appointments.filter(a => a.appointmentDate.startsWith(month));

    const totalAppointments = monthApps.length;
    const completed = monthApps.filter(a => a.status === "COMPLETED");
    const cancelled = monthApps.filter(a => a.status === "CANCELLED");
    const noShows = monthApps.filter(a => a.status === "NO_SHOW");

    const totalRevenue = completed.reduce((sum, a) => sum + a.calculatedPrice, 0);
    const avgTicket = completed.length > 0 ? totalRevenue / completed.length : 0;

    const byDate: Record<string, { count: number; revenue: number }> = {};
    for (const a of monthApps) {
      if (!byDate[a.appointmentDate]) byDate[a.appointmentDate] = { count: 0, revenue: 0 };
      byDate[a.appointmentDate].count++;
      if (a.status === "COMPLETED") byDate[a.appointmentDate].revenue += a.calculatedPrice;
    }

    const dailyBreakdown = Object.entries(byDate).map(([date, val]) => ({
      date,
      count: val.count,
      revenue: Math.round(val.revenue * 100) / 100
    }));

    return res.json({
      yearMonth: month,
      totalAppointments,
      completedAppointments: completed.length,
      cancelledAppointments: cancelled.length,
      noShowAppointments: noShows.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageTicketSize: Math.round(avgTicket * 100) / 100,
      dailyBreakdown
    });
  });

  app.get("/api/reports/services", (req: Request, res: Response) => {
    const serviceCounts: Record<number, number> = {};
    const serviceRevenue: Record<number, number> = {};
    let totalBookings = 0;
    let totalRev = 0;

    for (const a of appointments) {
      if (a.status !== "CANCELLED") {
        for (const sid of a.serviceIds) {
          const s = groomingServices.find(srv => srv.id === sid);
          if (s) {
            serviceCounts[sid] = (serviceCounts[sid] || 0) + 1;
            serviceRevenue[sid] = (serviceRevenue[sid] || 0) + s.basePrice;
            totalBookings++;
            totalRev += s.basePrice;
          }
        }
      }
    }

    const serviceStats = groomingServices.map(s => {
      const count = serviceCounts[s.id] || 0;
      const rev = serviceRevenue[s.id] || 0;
      const pct = totalBookings > 0 ? (count / totalBookings) * 100 : 0;
      return {
        serviceId: s.id,
        serviceName: s.name,
        basePrice: s.basePrice,
        bookingCount: count,
        revenueGenerated: Math.round(rev * 100) / 100,
        percentageOfTotalBookings: Math.round(pct * 10) / 10
      };
    }).sort((a, b) => b.bookingCount - a.bookingCount);

    return res.json({
      serviceStats,
      totalServiceBookings: totalBookings,
      totalServicesRevenue: Math.round(totalRev * 100) / 100
    });
  });

  app.get("/api/reports/customers", (req: Request, res: Response) => {
    let totalSpentAll = 0;
    let activeWithAppts = 0;

    const customerStats = customers.map(c => {
      const cApps = appointments.filter(a => a.customerId === c.id);
      const cPets = pets.filter(p => p.customerId === c.id);

      let spent = 0;
      let firstDate: string | null = null;
      let lastDate: string | null = null;

      for (const a of cApps) {
        if (a.status === "COMPLETED") spent += a.calculatedPrice;
        if (!firstDate || a.appointmentDate < firstDate) firstDate = a.appointmentDate;
        if (!lastDate || a.appointmentDate > lastDate) lastDate = a.appointmentDate;
      }

      if (cApps.length > 0) {
        activeWithAppts++;
        totalSpentAll += spent;
      }

      return {
        customerId: c.id,
        customerName: `${c.firstName} ${c.lastName}`,
        email: c.email,
        phone: c.phone,
        petCount: cPets.length,
        appointmentCount: cApps.length,
        firstAppointmentDate: firstDate,
        lastAppointmentDate: lastDate,
        totalAmountSpent: Math.round(spent * 100) / 100,
        status: cApps.length > 0 ? "Active" : "New"
      };
    }).sort((a, b) => b.totalAmountSpent - a.totalAmountSpent);

    const avgLtv = activeWithAppts > 0 ? totalSpentAll / activeWithAppts : 0;

    return res.json({
      customerStats,
      totalCustomers: customers.length,
      activeCustomersWithAppointments: activeWithAppts,
      averageCustomerLifetimeValue: Math.round(avgLtv * 100) / 100
    });
  });

  app.get("/api/reports/dashboard", (req: Request, res: Response) => {
    const today = "2026-09-15"; // Baseline simulation date matching seed data
    const todayApps = appointments.filter(a => a.appointmentDate === today);
    const upcomingApps = appointments.filter(a => a.appointmentDate >= today && a.status !== "CANCELLED");
    const completed = appointments.filter(a => a.status === "COMPLETED");
    const noShows = appointments.filter(a => a.status === "NO_SHOW");

    const monthlyRevenue = completed.reduce((sum, a) => sum + a.calculatedPrice, 0);

    return res.json({
      todayAppointmentsCount: todayApps.length,
      upcomingAppointmentsCount: upcomingApps.length,
      totalCustomersCount: customers.length,
      totalPetsCount: pets.length,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      completedAppointmentsCount: completed.length,
      noShowAppointmentsCount: noShows.length,
      todayAppointments: todayApps.map(formatAppointment),
      recentAppointments: appointments.slice(-5).reverse().map(formatAppointment)
    });
  });

  // -----------------------------------------------------------
  // Vite Integration
  // -----------------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pet Grooming Salon Management System server running at http://localhost:${PORT}`);
  });
}

startServer();
