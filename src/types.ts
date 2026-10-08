export type Role = "ADMIN" | "STAFF";

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: Role;
  enabled: boolean;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export type PetSpecies = "DOG" | "CAT" | "BIRD";

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  petCount?: number;
  appointmentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pet {
  id: number;
  species: PetSpecies;
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
  customerName?: string;
  createdAt?: string;
  updatedAt?: string;

  coatType?: string;
  requiresHandlingMuzzle?: boolean;
  indoorOnly?: boolean;
  declawed?: boolean;
  mattingSeverity?: string;
  wingClippingNeeded?: boolean;
  beakCondition?: string;
  cageTrained?: boolean;

  speciesMultiplier?: number;
  handlingSurcharge?: number;
  specialCareInstructions?: string;
}

export interface GroomingService {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  durationMinutes: number;
  active: boolean;
}

export type AppointmentStatus =
    | "SCHEDULED"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "NO_SHOW";

export interface Appointment {
  id: number;
  customerId: number;
  customerName: string;
  customerPhone?: string;
  petId: number;
  petName: string;
  petSpecies: PetSpecies;
  groomerId: number;
  groomerName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  services: GroomingService[];
  calculatedPrice: number;
  notes: string;
}

export interface AppointmentRequest {
  customerId: number;
  petId: number;
  groomerId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status?: AppointmentStatus;
  serviceIds: number[];
  notes?: string;
}

export interface PriceCalculationRequest {
  petId?: number;
  species?: PetSpecies;
  weight?: number;
  coatType?: string;
  mattingSeverity?: string;
  requiresHandlingMuzzle?: boolean;
  wingClippingNeeded?: boolean;
  serviceIds: number[];
}

export interface PriceCalculationResponse {
  baseServicesTotal: number;
  weightMultiplier: number;
  speciesMultiplier: number;
  weightAdjustmentAmount: number;
  handlingSurcharge: number;
  finalEstimatedPrice: number;
  totalDurationMinutes: number;
  appliedAdjustments: string[];
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export interface DailyScheduleItem {
  appointmentId: number;
  startTime: string;
  endTime: string;
  customerName: string;
  customerPhone: string;
  petName: string;
  petSpecies: string;
  groomerName: string;
  services: string[];
  status: string;
  price: number;
}

export interface DailyScheduleReport {
  date: string;
  totalAppointments: number;
  expectedRevenue: number;
  items: DailyScheduleItem[];
}

export interface DailyRevenueItem {
  date: string;
  dayOfWeek: string;
  count: number;
  completedCount: number;
  cancelledCount: number;
  revenue: number;
}

export interface MonthlyRevenueReport {
  yearMonth: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  totalRevenue: number;
  averageTicketSize: number;
  dailyBreakdown: DailyRevenueItem[];
}

export interface ServiceStatItem {
  serviceId: number;
  serviceName: string;
  category: string;
  basePrice: number;
  bookingCount: number;
  revenueGenerated: number;
  percentageOfTotalBookings: number;
}

export interface ServicePopularityReport {
  serviceStats: ServiceStatItem[];
  totalServiceBookings: number;
  totalServicesRevenue: number;
}

export interface CustomerRetentionItem {
  customerId: number;
  customerName: string;
  email: string;
  phone: string;
  petCount: number;
  appointmentCount: number;
  firstAppointmentDate: string | null;
  lastAppointmentDate: string | null;
  totalAmountSpent: number;
  status: string;
}

export interface CustomerRetentionReport {
  customerStats: CustomerRetentionItem[];
  totalCustomers: number;
  activeCustomersWithAppointments: number;
  lapsedCount: number;
  retentionRate: number;
  averageCustomerLifetimeValue: number;
}

export interface DashboardSummary {
  todayAppointmentsCount: number;
  upcomingAppointmentsCount: number;
  totalCustomersCount: number;
  totalPetsCount: number;
  monthlyRevenue: number;
  completedAppointmentsCount: number;
  noShowAppointmentsCount: number;
  todayAppointments: Appointment[];
  recentAppointments: Appointment[];
}