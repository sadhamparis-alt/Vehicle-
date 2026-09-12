/**
 * Core Data Models for Vehicle Expense & Maintenance Management System
 */

export interface User {
  userId: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  createdAt: string;
  updatedAt: string;
}

export type VehicleType = 
  | 'Car' 
  | 'Bike' 
  | 'Scooter' 
  | 'Van' 
  | 'Truck' 
  | 'Bus' 
  | 'Auto' 
  | 'Tractor' 
  | 'Other';

export type FuelType = 
  | 'Petrol' 
  | 'Diesel' 
  | 'CNG' 
  | 'LPG' 
  | 'Electric' 
  | 'Hybrid' 
  | 'Other';

export interface Vehicle {
  vehicleId: string;
  userId: string;
  vehicleName: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  year: number;
  fuelType: FuelType;
  purchaseDate: string;
  currentOdometer: number;
  currentOperatingHours: number;
  imageUrl?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCategory {
  categoryId: string;
  name: string;
  icon: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ExpenseSubcategory {
  subcategoryId: string;
  categoryId: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
}

export type PaymentMethod = 
  | 'Cash' 
  | 'UPI' 
  | 'Credit Card' 
  | 'Debit Card' 
  | 'Bank Transfer' 
  | 'Other';

export interface Expense {
  expenseId: string;
  userId: string;
  vehicleId: string;
  categoryId: string;
  subcategoryId: string;
  date: string; // ISO date string YYYY-MM-DD
  amount: number;
  odometer: number;
  operatingHours: number;
  paymentMethod: PaymentMethod;
  vendorName?: string;
  invoiceNumber?: string;
  description?: string;
  receiptUrl?: string;
  isRecurring: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceType {
  maintenanceTypeId: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
}

export interface MaintenanceSchedule {
  scheduleId: string;
  userId: string;
  vehicleId: string;
  maintenanceTypeId: string;
  customName?: string;

  // Last service
  lastServiceDate: string;
  lastServiceOdometer: number;
  lastServiceHours: number;

  // Next service
  nextDueDate: string;
  nextDueOdometer: number;
  nextDueHours: number;

  // Intervals
  intervalDays: number;
  intervalKilometers: number;
  intervalHours: number;

  // Reminder settings
  reminderDaysBefore: number;
  reminderKmBefore: number;
  reminderHoursBefore: number;

  // Other
  estimatedCost: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  recordId: string;
  userId: string;
  vehicleId: string;
  scheduleId?: string;
  maintenanceTypeId: string;
  serviceDate: string;
  odometer: number;
  operatingHours: number;
  cost: number;
  vendorName?: string;
  invoiceNumber?: string;
  description?: string;
  partsChanged?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
}

export type ReminderType = 
  | 'Date' 
  | 'Kilometer' 
  | 'Operating Hours' 
  | 'Insurance' 
  | 'PUC' 
  | 'Tax' 
  | 'Custom';

export type ReminderStatus = 
  | 'Upcoming' 
  | 'Due Soon' 
  | 'Due' 
  | 'Overdue' 
  | 'Completed' 
  | 'Dismissed';

export interface Reminder {
  reminderId: string;
  userId: string;
  vehicleId: string;
  scheduleId?: string;
  title: string;
  message: string;
  reminderType: ReminderType;
  dueDate: string;
  dueOdometer: number;
  dueHours: number;
  status: ReminderStatus;
  notificationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFilter {
  vehicleId?: string;
  categoryId?: string;
  subcategoryId?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}

export interface MaintenanceFilter {
  vehicleId?: string;
  maintenanceTypeId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

export interface VehicleExpenseSummary {
  vehicleId: string;
  vehicleName: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  fuelType: FuelType;
  totalExpense: number;
  fuelExpense: number;
  maintenanceExpense: number;
  repairExpense: number;
  currentKm: number;
  currentHours: number;
  expenseCount: number;
}

export interface DashboardMetrics {
  todayTotal: number;
  thisWeekTotal: number;
  thisMonthTotal: number;
  totalExpense: number;
  totalAllTime: number;
  fuelExpense: number;
  maintenanceExpense: number;
  repairExpense: number;
  otherExpense: number;
  totalVehicles: number;
  upcomingMaintenance: number;
  dueMaintenance: number;
  overdueMaintenance: number;
  totalMaintenanceRecords: number;
  maintenanceCounts: {
    upcoming: number;
    dueSoon: number;
    overdue: number;
  };
  vehicleSummaries: VehicleExpenseSummary[];
}
