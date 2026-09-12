import {
  DEFAULT_CATEGORIES,
  DEFAULT_MAINTENANCE_TYPES,
  DEFAULT_SUBCATEGORIES,
  DEFAULT_USERS,
  INITIAL_VEHICLES,
} from '../data/defaultData';
import {
  DashboardMetrics,
  Expense,
  ExpenseCategory,
  ExpenseFilter,
  ExpenseSubcategory,
  MaintenanceFilter,
  MaintenanceRecord,
  MaintenanceSchedule,
  MaintenanceType,
  Reminder,
  ReminderStatus,
  User,
  Vehicle,
  VehicleExpenseSummary,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'vms_users_v1',
  CURRENT_USER_ID: 'vms_current_user_id_v1',
  VEHICLES: 'vms_vehicles_v1',
  CATEGORIES: 'vms_expense_categories_v1',
  SUBCATEGORIES: 'vms_expense_subcategories_v1',
  EXPENSES: 'vms_expenses_v1',
  MAINTENANCE_TYPES: 'vms_maintenance_types_v1',
  MAINTENANCE_SCHEDULES: 'vms_maintenance_schedules_v1',
  MAINTENANCE_RECORDS: 'vms_maintenance_records_v1',
  REMINDERS: 'vms_reminders_v1',
};

// Event bus for real-time reactivity across components
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// LocalStorage helpers with safe JSON parsing
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

// Initial seed data generator if storage is fresh - REMOVES ALL DEMO DATA
function initializeStorageIfEmpty(): void {
  // Purge any lingering legacy demo data keys or sample demo users
  const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
  const storedVehicles = localStorage.getItem(STORAGE_KEYS.VEHICLES);
  const storedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  
  if (
    (storedUsers && (storedUsers.includes('user_alex_01') || storedUsers.includes('Alex Morgan') || storedUsers.includes('Priya Sharma'))) ||
    (storedVehicles && (storedVehicles.includes('veh_01_toyota_rav4') || storedVehicles.includes('Toyota RAV4') || storedVehicles.includes('Ford F-150'))) ||
    (storedExpenses && (storedExpenses.includes('exp_01') || storedExpenses.includes('Shell Express')))
  ) {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.VEHICLES);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.MAINTENANCE_SCHEDULES);
    localStorage.removeItem(STORAGE_KEYS.MAINTENANCE_RECORDS);
    localStorage.removeItem(STORAGE_KEYS.REMINDERS);
  }

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    saveToStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
    saveToStorage(STORAGE_KEYS.CURRENT_USER_ID, DEFAULT_USERS[0].userId);
  }
  if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
    saveToStorage(STORAGE_KEYS.VEHICLES, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    saveToStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBCATEGORIES)) {
    saveToStorage(STORAGE_KEYS.SUBCATEGORIES, DEFAULT_SUBCATEGORIES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.MAINTENANCE_TYPES)) {
    saveToStorage(STORAGE_KEYS.MAINTENANCE_TYPES, DEFAULT_MAINTENANCE_TYPES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
    saveToStorage(STORAGE_KEYS.EXPENSES, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.MAINTENANCE_SCHEDULES)) {
    saveToStorage(STORAGE_KEYS.MAINTENANCE_SCHEDULES, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.MAINTENANCE_RECORDS)) {
    saveToStorage(STORAGE_KEYS.MAINTENANCE_RECORDS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.REMINDERS)) {
    saveToStorage(STORAGE_KEYS.REMINDERS, []);
  }
}

// Run initializer on module load
initializeStorageIfEmpty();

/**
 * DATABASE REPOSITORY SERVICE
 */
export const db = {
  // -------------------------------------------------------------
  // USER OPERATIONS & MULTI-TENANCY ISOLATION
  // -------------------------------------------------------------
  getUsers(): User[] {
    return getFromStorage<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  },

  getCurrentUserId(): string {
    return getFromStorage<string>(STORAGE_KEYS.CURRENT_USER_ID, DEFAULT_USERS[0].userId);
  },

  setCurrentUserId(userId: string): void {
    saveToStorage(STORAGE_KEYS.CURRENT_USER_ID, userId);
    // Re-evaluate reminders when user changes
    this.refreshRemindersForUser(userId);
    notify();
  },

  getCurrentUser(): User {
    const users = this.getUsers();
    const currentId = this.getCurrentUserId();
    const found = users.find((u) => u.userId === currentId);
    return found || users[0] || DEFAULT_USERS[0];
  },

  updateUserProfile(userId: string, updates: Partial<User>): User {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.userId === userId);
    if (index === -1) throw new Error('User not found');
    const updated: User = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    users[index] = updated;
    saveToStorage(STORAGE_KEYS.USERS, users);
    notify();
    return updated;
  },

  // -------------------------------------------------------------
  // VEHICLE OPERATIONS (Isolated by current userId)
  // -------------------------------------------------------------
  getVehicles(userId: string = this.getCurrentUserId()): Vehicle[] {
    const all = getFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES);
    return all.filter((v) => v.userId === userId);
  },

  getVehicleById(vehicleId: string, userId: string = this.getCurrentUserId()): Vehicle | undefined {
    return this.getVehicles(userId).find((v) => v.vehicleId === vehicleId);
  },

  createVehicle(vehicleData: Omit<Vehicle, 'vehicleId' | 'userId' | 'createdAt' | 'updatedAt'>): Vehicle {
    const userId = this.getCurrentUserId();
    const all = getFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, []);
    const newVehicle: Vehicle = {
      ...vehicleData,
      vehicleId: `veh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all.push(newVehicle);
    saveToStorage(STORAGE_KEYS.VEHICLES, all);
    notify();
    return newVehicle;
  },

  updateVehicle(vehicleId: string, updates: Partial<Vehicle>): Vehicle {
    const userId = this.getCurrentUserId();
    const all = getFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, []);
    const index = all.findIndex((v) => v.vehicleId === vehicleId && v.userId === userId);
    if (index === -1) {
      throw new Error('Vehicle not found or unauthorized');
    }
    const updated: Vehicle = {
      ...all[index],
      ...updates,
      vehicleId: all[index].vehicleId,
      userId: all[index].userId, // Never allow changing userId
      updatedAt: new Date().toISOString(),
    };
    all[index] = updated;
    saveToStorage(STORAGE_KEYS.VEHICLES, all);

    // If odometer or operating hours changed, immediately re-evaluate reminders
    if (updates.currentOdometer !== undefined || updates.currentOperatingHours !== undefined) {
      this.refreshRemindersForUser(userId);
    }

    notify();
    return updated;
  },

  deleteVehicle(vehicleId: string): void {
    const userId = this.getCurrentUserId();
    const all = getFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, []);
    const filtered = all.filter((v) => !(v.vehicleId === vehicleId && v.userId === userId));
    saveToStorage(STORAGE_KEYS.VEHICLES, filtered);

    // Cascade delete vehicle's expenses, schedules, records, reminders
    const expenses = getFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []).filter(
      (e) => !(e.vehicleId === vehicleId && e.userId === userId)
    );
    saveToStorage(STORAGE_KEYS.EXPENSES, expenses);

    const schedules = getFromStorage<MaintenanceSchedule[]>(STORAGE_KEYS.MAINTENANCE_SCHEDULES, []).filter(
      (s) => !(s.vehicleId === vehicleId && s.userId === userId)
    );
    saveToStorage(STORAGE_KEYS.MAINTENANCE_SCHEDULES, schedules);

    const records = getFromStorage<MaintenanceRecord[]>(STORAGE_KEYS.MAINTENANCE_RECORDS, []).filter(
      (r) => !(r.vehicleId === vehicleId && r.userId === userId)
    );
    saveToStorage(STORAGE_KEYS.MAINTENANCE_RECORDS, records);

    const reminders = getFromStorage<Reminder[]>(STORAGE_KEYS.REMINDERS, []).filter(
      (rem) => !(rem.vehicleId === vehicleId && rem.userId === userId)
    );
    saveToStorage(STORAGE_KEYS.REMINDERS, reminders);

    notify();
  },

  // -------------------------------------------------------------
  // DYNAMIC CATEGORIES & SUBCATEGORIES (Loaded from DB)
  // -------------------------------------------------------------
  getCategories(): ExpenseCategory[] {
    const cats = getFromStorage<ExpenseCategory[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    return cats.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  getSubcategories(categoryId?: string): ExpenseSubcategory[] {
    const subcats = getFromStorage<ExpenseSubcategory[]>(STORAGE_KEYS.SUBCATEGORIES, DEFAULT_SUBCATEGORIES);
    if (categoryId) {
      return subcats
        .filter((s) => s.categoryId === categoryId && s.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return subcats.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  createCategory(category: Omit<ExpenseCategory, 'categoryId'>): ExpenseCategory {
    const all = this.getCategories();
    const newCat: ExpenseCategory = {
      ...category,
      categoryId: `cat_${Date.now()}`,
    };
    all.push(newCat);
    saveToStorage(STORAGE_KEYS.CATEGORIES, all);
    notify();
    return newCat;
  },

  createSubcategory(subcategory: Omit<ExpenseSubcategory, 'subcategoryId'>): ExpenseSubcategory {
    const all = getFromStorage<ExpenseSubcategory[]>(STORAGE_KEYS.SUBCATEGORIES, DEFAULT_SUBCATEGORIES);
    const newSub: ExpenseSubcategory = {
      ...subcategory,
      subcategoryId: `sub_${Date.now()}`,
    };
    all.push(newSub);
    saveToStorage(STORAGE_KEYS.SUBCATEGORIES, all);
    notify();
    return newSub;
  },

  // -------------------------------------------------------------
  // EXPENSES (Strict validation & isolation)
  // -------------------------------------------------------------
  getExpenses(filter?: ExpenseFilter, userId: string = this.getCurrentUserId()): Expense[] {
    let list = getFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []).filter((e) => e.userId === userId);

    if (filter) {
      if (filter.vehicleId) {
        list = list.filter((e) => e.vehicleId === filter.vehicleId);
      }
      if (filter.categoryId) {
        list = list.filter((e) => e.categoryId === filter.categoryId);
      }
      if (filter.subcategoryId) {
        list = list.filter((e) => e.subcategoryId === filter.subcategoryId);
      }
      if (filter.startDate) {
        list = list.filter((e) => e.date >= filter.startDate!);
      }
      if (filter.endDate) {
        list = list.filter((e) => e.date <= filter.endDate!);
      }
      if (filter.paymentMethod) {
        list = list.filter((e) => e.paymentMethod === filter.paymentMethod);
      }
      if (filter.minAmount !== undefined) {
        list = list.filter((e) => e.amount >= filter.minAmount!);
      }
      if (filter.maxAmount !== undefined) {
        list = list.filter((e) => e.amount <= filter.maxAmount!);
      }
      if (filter.searchQuery && filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase().trim();
        const vehicles = this.getVehicles(userId);
        const vehMap = new Map<string, Vehicle>(vehicles.map((v) => [v.vehicleId, v]));

        list = list.filter((e) => {
          const veh = vehMap.get(e.vehicleId);
          const vehNameMatch = veh?.vehicleName.toLowerCase().includes(query) ?? false;
          const vehNumMatch = veh?.vehicleNumber.toLowerCase().includes(query) ?? false;
          const vendorMatch = e.vendorName?.toLowerCase().includes(query) ?? false;
          const descMatch = e.description?.toLowerCase().includes(query) ?? false;
          const invMatch = e.invoiceNumber?.toLowerCase().includes(query) ?? false;
          return vehNameMatch || vehNumMatch || vendorMatch || descMatch || invMatch;
        });
      }
    }

    // Default order: Most recent date descending
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  createExpense(expenseData: Omit<Expense, 'expenseId' | 'userId' | 'createdAt' | 'updatedAt'>): Expense {
    // Validations (Requirement 5)
    if (expenseData.amount <= 0) {
      throw new Error('Validation error: Expense amount must be greater than 0');
    }
    if (expenseData.odometer < 0) {
      throw new Error('Validation error: Odometer cannot be negative');
    }
    if (expenseData.operatingHours < 0) {
      throw new Error('Validation error: Operating hours cannot be negative');
    }
    if (!expenseData.categoryId || !expenseData.subcategoryId) {
      throw new Error('Validation error: Required category and subcategory');
    }
    if (!expenseData.vehicleId) {
      throw new Error('Validation error: Required vehicle');
    }
    if (!expenseData.date) {
      throw new Error('Validation error: Required date');
    }

    const userId = this.getCurrentUserId();
    const all = getFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []);
    const newExpense: Expense = {
      ...expenseData,
      expenseId: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all.push(newExpense);
    saveToStorage(STORAGE_KEYS.EXPENSES, all);

    // If new expense odometer/hours is higher than current vehicle record, auto-update vehicle odometer
    const vehicle = this.getVehicleById(newExpense.vehicleId, userId);
    if (vehicle) {
      let needsVehUpdate = false;
      const updates: Partial<Vehicle> = {};
      if (newExpense.odometer > vehicle.currentOdometer) {
        updates.currentOdometer = newExpense.odometer;
        needsVehUpdate = true;
      }
      if (newExpense.operatingHours > vehicle.currentOperatingHours) {
        updates.currentOperatingHours = newExpense.operatingHours;
        needsVehUpdate = true;
      }
      if (needsVehUpdate) {
        this.updateVehicle(vehicle.vehicleId, updates);
      }
    }

    notify();
    return newExpense;
  },

  updateExpense(expenseId: string, updates: Partial<Expense>): Expense {
    const userId = this.getCurrentUserId();
    const all = getFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []);
    const index = all.findIndex((e) => e.expenseId === expenseId && e.userId === userId);
    if (index === -1) throw new Error('Expense not found or unauthorized');

    if (updates.amount !== undefined && updates.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    if (updates.odometer !== undefined && updates.odometer < 0) {
      throw new Error('Odometer cannot be negative');
    }
    if (updates.operatingHours !== undefined && updates.operatingHours < 0) {
      throw new Error('Operating hours cannot be negative');
    }

    const updated: Expense = {
      ...all[index],
      ...updates,
      expenseId: all[index].expenseId,
      userId: all[index].userId, // Lock userId
      updatedAt: new Date().toISOString(),
    };
    all[index] = updated;
    saveToStorage(STORAGE_KEYS.EXPENSES, all);
    notify();
    return updated;
  },

  deleteExpense(expenseId: string): void {
    const userId = this.getCurrentUserId();
    const all = getFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []);
    const filtered = all.filter((e) => !(e.expenseId === expenseId && e.userId === userId));
    saveToStorage(STORAGE_KEYS.EXPENSES, filtered);
    notify();
  },

  // -------------------------------------------------------------
  // MAINTENANCE TYPES
  // -------------------------------------------------------------
  getMaintenanceTypes(): MaintenanceType[] {
    const types = getFromStorage<MaintenanceType[]>(STORAGE_KEYS.MAINTENANCE_TYPES, DEFAULT_MAINTENANCE_TYPES);
    return types.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  // -------------------------------------------------------------
  // MAINTENANCE SCHEDULES & AUTOMATIC NEXT-DUE CALCULATION
  // -------------------------------------------------------------
  getMaintenanceSchedules(filter?: MaintenanceFilter, userId: string = this.getCurrentUserId()): MaintenanceSchedule[] {
    let list = getFromStorage<MaintenanceSchedule[]>(STORAGE_KEYS.MAINTENANCE_SCHEDULES, []).filter(
      (s) => s.userId === userId
    );

    if (filter) {
      if (filter.vehicleId) {
        list = list.filter((s) => s.vehicleId === filter.vehicleId);
      }
      if (filter.maintenanceTypeId) {
        list = list.filter((s) => s.maintenanceTypeId === filter.maintenanceTypeId);
      }
      if (filter.searchQuery && filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase().trim();
        const types = this.getMaintenanceTypes();
        const typeMap = new Map<string, string>(types.map((t) => [t.maintenanceTypeId, t.name.toLowerCase()]));
        list = list.filter((s) => {
          const typeName = typeMap.get(s.maintenanceTypeId) || '';
          const customName = s.customName?.toLowerCase() || '';
          return typeName.includes(query) || customName.includes(query);
        });
      }
    }

    return list;
  },

  createMaintenanceSchedule(
    scheduleData: Omit<MaintenanceSchedule, 'scheduleId' | 'userId' | 'createdAt' | 'updatedAt'>
  ): MaintenanceSchedule {
    const userId = this.getCurrentUserId();
    const all = getFromStorage<MaintenanceSchedule[]>(STORAGE_KEYS.MAINTENANCE_SCHEDULES, []);
    const newSchedule: MaintenanceSchedule = {
      ...scheduleData,
      scheduleId: `sched_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all.push(newSchedule);
    saveToStorage(STORAGE_KEYS.MAINTENANCE_SCHEDULES, all);

    // Refresh reminders
    this.refreshRemindersForUser(userId);
    notify();
    return newSchedule;
  },

  updateMaintenanceSchedule(scheduleId: string, updates: Partial<MaintenanceSchedule>): MaintenanceSchedule {
    const userId = this.getCurrentUserId();
    const all = getFromStorage<MaintenanceSchedule[]>(STORAGE_KEYS.MAINTENANCE_SCHEDULES, []);
    const index = all.findIndex((s) => s.scheduleId === scheduleId && s.userId === userId);
    if (index === -1) throw new Error('Maintenance schedule not found or unauthorized');

    const updated: MaintenanceSchedule = {
      ...all[index],
      ...updates,
      scheduleId: all[index].scheduleId,
      userId: all[index].userId,
      updatedAt: new Date().toISOString(),
    };
    all[index] = updated;
    saveToStorage(STORAGE_KEYS.MAINTENANCE_SCHEDULES, all);
    this.refreshRemindersForUser(userId);
    notify();
    return updated;
  },

  deleteMaintenanceSchedule(scheduleId: string): void {
    const userId = this.getCurrentUserId();
    const all = getFromStorage<MaintenanceSchedule[]>(STORAGE_KEYS.MAINTENANCE_SCHEDULES, []);
    const filtered = all.filter((s) => !(s.scheduleId === scheduleId && s.userId === userId));
    saveToStorage(STORAGE_KEYS.MAINTENANCE_SCHEDULES, filtered);

    // Also remove any reminders bound to this schedule
    const reminders = getFromStorage<Reminder[]>(STORAGE_KEYS.REMINDERS, []).filter(
      (r) => !(r.scheduleId === scheduleId && r.userId === userId)
    );
    saveToStorage(STORAGE_KEYS.REMINDERS, reminders);

    notify();
  },

  // -------------------------------------------------------------
  // MAINTENANCE RECORDS (Completed Service -> Recalculate Next Due)
  // -------------------------------------------------------------
  getMaintenanceRecords(vehicleId?: string, userId: string = this.getCurrentUserId()): MaintenanceRecord[] {
    let records = getFromStorage<MaintenanceRecord[]>(STORAGE_KEYS.MAINTENANCE_RECORDS, []).filter(
      (r) => r.userId === userId
    );
    if (vehicleId) {
      records = records.filter((r) => r.vehicleId === vehicleId);
    }
    return records.sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
  },

  deleteMaintenanceRecord(recordId: string, userId: string = this.getCurrentUserId()): void {
    const records = getFromStorage<MaintenanceRecord[]>(STORAGE_KEYS.MAINTENANCE_RECORDS, []);
    const filtered = records.filter((r) => !(r.recordId === recordId && r.userId === userId));
    saveToStorage(STORAGE_KEYS.MAINTENANCE_RECORDS, filtered);
    notify();
  },

  /**
   * Completes a service, creates record, and calculates:
   * nextDueOdometer = completedOdometer + intervalKilometers
   * nextDueDate = completedDate + intervalDays
   * nextDueHours = completedHours + intervalHours
   * (Requirement 8)
   */
  completeMaintenanceService(data: {
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
    createExpenseEntry?: boolean;
  }): MaintenanceRecord {
    const userId = this.getCurrentUserId();

    // 1. Create Maintenance Record
    const record: MaintenanceRecord = {
      recordId: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      vehicleId: data.vehicleId,
      scheduleId: data.scheduleId,
      maintenanceTypeId: data.maintenanceTypeId,
      serviceDate: data.serviceDate,
      odometer: data.odometer,
      operatingHours: data.operatingHours,
      cost: data.cost,
      vendorName: data.vendorName,
      invoiceNumber: data.invoiceNumber,
      description: data.description,
      partsChanged: data.partsChanged,
      receiptUrl: data.receiptUrl,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    const allRecords = getFromStorage<MaintenanceRecord[]>(STORAGE_KEYS.MAINTENANCE_RECORDS, []);
    allRecords.push(record);
    saveToStorage(STORAGE_KEYS.MAINTENANCE_RECORDS, allRecords);

    // 2. Automatically update related maintenance schedule if linked
    if (data.scheduleId) {
      const schedules = getFromStorage<MaintenanceSchedule[]>(STORAGE_KEYS.MAINTENANCE_SCHEDULES, []);
      const schedIndex = schedules.findIndex((s) => s.scheduleId === data.scheduleId && s.userId === userId);

      if (schedIndex !== -1) {
        const schedule = schedules[schedIndex];

        // Date calculation: completedDate + intervalDays
        const completedDateObj = new Date(data.serviceDate);
        const nextDueDateObj = new Date(completedDateObj);
        nextDueDateObj.setDate(nextDueDateObj.getDate() + (schedule.intervalDays || 180));
        const nextDueDateStr = nextDueDateObj.toISOString().split('T')[0];

        // Odometer calculation: completedOdometer + intervalKilometers
        const nextDueOdo = data.odometer + (schedule.intervalKilometers || 5000);

        // Hours calculation: completedHours + intervalHours
        const nextDueHrs = data.operatingHours + (schedule.intervalHours || 200);

        schedules[schedIndex] = {
          ...schedule,
          lastServiceDate: data.serviceDate,
          lastServiceOdometer: data.odometer,
          lastServiceHours: data.operatingHours,
          nextDueDate: nextDueDateStr,
          nextDueOdometer: nextDueOdo,
          nextDueHours: nextDueHrs,
          updatedAt: new Date().toISOString(),
        };

        saveToStorage(STORAGE_KEYS.MAINTENANCE_SCHEDULES, schedules);
      }
    }

    // 3. Update vehicle odometer / operating hours if higher
    const vehicle = this.getVehicleById(data.vehicleId, userId);
    if (vehicle) {
      const updates: Partial<Vehicle> = {};
      if (data.odometer > vehicle.currentOdometer) {
        updates.currentOdometer = data.odometer;
      }
      if (data.operatingHours > vehicle.currentOperatingHours) {
        updates.currentOperatingHours = data.operatingHours;
      }
      if (Object.keys(updates).length > 0) {
        this.updateVehicle(data.vehicleId, updates);
      }
    }

    // 4. Optionally create linked Expense entry in "Periodic Service" or "Labour & Workshop"
    if (data.createExpenseEntry && data.cost > 0) {
      try {
        this.createExpense({
          vehicleId: data.vehicleId,
          categoryId: 'cat_periodic_service',
          subcategoryId: 'sub_serv_scheduled',
          date: data.serviceDate,
          amount: data.cost,
          odometer: data.odometer,
          operatingHours: data.operatingHours,
          paymentMethod: 'Credit Card',
          vendorName: data.vendorName || 'Workshop',
          invoiceNumber: data.invoiceNumber,
          description: data.description || 'Completed scheduled maintenance service',
          isRecurring: false,
        });
      } catch (e) {
        console.warn('Could not auto-create expense entry:', e);
      }
    }

    // 5. Refresh reminder calculations
    this.refreshRemindersForUser(userId);
    notify();
    return record;
  },

  // -------------------------------------------------------------
  // AUTOMATIC REMINDERS ENGINE (Requirement 9 & 10)
  // -------------------------------------------------------------
  /**
   * Continuous comparison:
   * Current Date vs Next Due Date
   * Current Odometer vs Next Due Odometer
   * Current Operating Hours vs Next Due Hours
   *
   * Rules:
   * - If due date has passed: status = "Overdue"
   * - If current KM >= next due KM: status = "Overdue"
   * - If current hours >= next due hours: status = "Overdue"
   * - If within configured reminder threshold: status = "Due Soon"
   * - Otherwise: status = "Upcoming"
   * - Avoids duplicate reminders for the same schedule!
   */
  refreshRemindersForUser(userId: string = this.getCurrentUserId()): Reminder[] {
    const vehicles = this.getVehicles(userId);
    const schedules = this.getMaintenanceSchedules(undefined, userId);
    const types = this.getMaintenanceTypes();
    const typeMap = new Map(types.map((t) => [t.maintenanceTypeId, t.name]));

    const existingReminders = getFromStorage<Reminder[]>(STORAGE_KEYS.REMINDERS, []);
    const otherUsersReminders = existingReminders.filter((r) => r.userId !== userId);
    const userRemindersMap = new Map<string, Reminder>();

    // Index existing active user reminders by scheduleId or reminderId
    existingReminders
      .filter((r) => r.userId === userId)
      .forEach((r) => {
        if (r.scheduleId) {
          userRemindersMap.set(r.scheduleId, r);
        } else {
          userRemindersMap.set(r.reminderId, r);
        }
      });

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const todayTimestamp = new Date(todayStr).getTime();

    const evaluatedReminders: Reminder[] = [];

    schedules.forEach((sched) => {
      if (!sched.isActive) return;
      const vehicle = vehicles.find((v) => v.vehicleId === sched.vehicleId);
      if (!vehicle) return;

      const typeName = typeMap.get(sched.maintenanceTypeId) || sched.customName || 'Service';
      const title = sched.customName || `${typeName} for ${vehicle.vehicleName}`;

      // Calculate status according to requirements:
      const nextDueTime = new Date(sched.nextDueDate).getTime();
      const daysUntilDue = Math.ceil((nextDueTime - todayTimestamp) / (1000 * 60 * 60 * 24));
      const kmUntilDue = sched.nextDueOdometer - vehicle.currentOdometer;
      const hoursUntilDue = sched.nextDueHours - vehicle.currentOperatingHours;

      let calculatedStatus: ReminderStatus = 'Upcoming';
      let message = `Due in ${daysUntilDue} days (${kmUntilDue > 0 ? kmUntilDue + ' km left' : '0 km'})`;

      // 1. Overdue conditions
      const isDateOverdue = daysUntilDue < 0;
      const isKmOverdue = vehicle.currentOdometer >= sched.nextDueOdometer && sched.nextDueOdometer > 0;
      const isHoursOverdue = vehicle.currentOperatingHours >= sched.nextDueHours && sched.nextDueHours > 0;

      if (isDateOverdue || isKmOverdue || isHoursOverdue) {
        calculatedStatus = 'Overdue';
        const reasons: string[] = [];
        if (isDateOverdue) reasons.push(`${Math.abs(daysUntilDue)} days overdue`);
        if (isKmOverdue) reasons.push(`${Math.abs(kmUntilDue)} km past due`);
        if (isHoursOverdue) reasons.push(`${Math.abs(hoursUntilDue)} hrs past due`);
        message = `Critical: ${reasons.join(', ')}. Schedule immediate service.`;
      } else {
        // 2. Due Soon conditions (within thresholds)
        const withinDaysThreshold = daysUntilDue <= (sched.reminderDaysBefore || 14);
        const withinKmThreshold = kmUntilDue <= (sched.reminderKmBefore || 500);
        const withinHoursThreshold = hoursUntilDue <= (sched.reminderHoursBefore || 25);

        if (withinDaysThreshold || withinKmThreshold || withinHoursThreshold) {
          calculatedStatus = 'Due Soon';
          message = `Attention: Approaching due threshold (in ${daysUntilDue} days / ${kmUntilDue} km).`;
        } else {
          calculatedStatus = 'Upcoming';
          message = `Scheduled for ${sched.nextDueDate} at ${sched.nextDueOdometer.toLocaleString()} km.`;
        }
      }

      // Check if this schedule already has a reminder in userRemindersMap
      const existing = userRemindersMap.get(sched.scheduleId);
      if (existing) {
        // Retain dismissed or completed status if user explicitly acted, unless it became newly overdue!
        let status: ReminderStatus = calculatedStatus;
        if (existing.status === 'Dismissed' && calculatedStatus !== 'Overdue') {
          status = 'Dismissed';
        }

        const updatedReminder: Reminder = {
          ...existing,
          title,
          message,
          dueDate: sched.nextDueDate,
          dueOdometer: sched.nextDueOdometer,
          dueHours: sched.nextDueHours,
          status,
          updatedAt: new Date().toISOString(),
        };
        evaluatedReminders.push(updatedReminder);
      } else {
        // Create new reminder (No duplicates)
        const newReminder: Reminder = {
          reminderId: `rem_${sched.scheduleId}_${Date.now()}`,
          userId,
          vehicleId: sched.vehicleId,
          scheduleId: sched.scheduleId,
          title,
          message,
          reminderType: 'Date',
          dueDate: sched.nextDueDate,
          dueOdometer: sched.nextDueOdometer,
          dueHours: sched.nextDueHours,
          status: calculatedStatus,
          notificationEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        evaluatedReminders.push(newReminder);
      }
    });

    // Also keep custom reminders (not attached to schedules)
    existingReminders
      .filter((r) => r.userId === userId && !r.scheduleId)
      .forEach((customRem) => {
        evaluatedReminders.push(customRem);
      });

    // Save combined back to storage
    const combined = [...otherUsersReminders, ...evaluatedReminders];
    saveToStorage(STORAGE_KEYS.REMINDERS, combined);
    return evaluatedReminders;
  },

  getReminders(statusFilter?: ReminderStatus, vehicleId?: string, userId: string = this.getCurrentUserId()): Reminder[] {
    // Run live refresh to ensure real-time accuracy
    const activeReminders = this.refreshRemindersForUser(userId);
    let result = activeReminders;

    if (statusFilter) {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (vehicleId) {
      result = result.filter((r) => r.vehicleId === vehicleId);
    }

    // Sort: Overdue first, then Due Soon, then Upcoming, etc.
    const priorityMap: Record<ReminderStatus, number> = {
      Overdue: 1,
      'Due Soon': 2,
      Due: 3,
      Upcoming: 4,
      Completed: 5,
      Dismissed: 6,
    };

    return result.sort((a, b) => {
      const pDiff = (priorityMap[a.status] || 99) - (priorityMap[b.status] || 99);
      if (pDiff !== 0) return pDiff;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  },

  updateReminderStatus(reminderId: string, status: ReminderStatus): void {
    const userId = this.getCurrentUserId();
    const all = getFromStorage<Reminder[]>(STORAGE_KEYS.REMINDERS, []);
    const index = all.findIndex((r) => r.reminderId === reminderId && r.userId === userId);
    if (index !== -1) {
      all[index].status = status;
      all[index].updatedAt = new Date().toISOString();
      saveToStorage(STORAGE_KEYS.REMINDERS, all);
      notify();
    }
  },

  createCustomReminder(data: Omit<Reminder, 'reminderId' | 'userId' | 'createdAt' | 'updatedAt'>): Reminder {
    const userId = this.getCurrentUserId();
    const all = getFromStorage<Reminder[]>(STORAGE_KEYS.REMINDERS, []);
    const newRem: Reminder = {
      ...data,
      reminderId: `rem_cust_${Date.now()}`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all.push(newRem);
    saveToStorage(STORAGE_KEYS.REMINDERS, all);
    notify();
    return newRem;
  },

  deleteReminder(reminderId: string): void {
    const userId = this.getCurrentUserId();
    const all = getFromStorage<Reminder[]>(STORAGE_KEYS.REMINDERS, []);
    const filtered = all.filter((r) => !(r.reminderId === reminderId && r.userId === userId));
    saveToStorage(STORAGE_KEYS.REMINDERS, filtered);
    notify();
  },

  // -------------------------------------------------------------
  // DASHBOARD CALCULATIONS (Requirement 11)
  // -------------------------------------------------------------
  getDashboardMetrics(userId: string = this.getCurrentUserId()) {
    const expenses = this.getExpenses(undefined, userId);
    const vehicles = this.getVehicles(userId);
    const reminders = this.getReminders(undefined, undefined, userId);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // 1. Calculate Monday through Sunday of current week
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
    // In standard Mon-Sun week:
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const mondayStr = monday.toISOString().split('T')[0];
    const sundayStr = sunday.toISOString().split('T')[0];

    // 2. Calculate First day through Last day of current month
    const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const firstMonthStr = firstDayMonth.toISOString().split('T')[0];
    const lastMonthStr = lastDayMonth.toISOString().split('T')[0];

    let todayTotal = 0;
    let thisWeekTotal = 0;
    let thisMonthTotal = 0;
    let totalAllTime = 0;
    let fuelExpense = 0;
    let maintenanceExpense = 0;
    let repairExpense = 0;
    let otherExpense = 0;

    expenses.forEach((e) => {
      totalAllTime += e.amount;
      if (e.date === todayStr) {
        todayTotal += e.amount;
      }
      if (e.date >= mondayStr && e.date <= sundayStr) {
        thisWeekTotal += e.amount;
      }
      if (e.date >= firstMonthStr && e.date <= lastMonthStr) {
        thisMonthTotal += e.amount;
      }

      if (e.categoryId === 'cat_fuel') {
        fuelExpense += e.amount;
      } else if (e.categoryId === 'cat_periodic_service' || e.categoryId === 'cat_engine_fluids') {
        maintenanceExpense += e.amount;
      } else if (
        e.categoryId === 'cat_brakes' ||
        e.categoryId === 'cat_engine_transmission' ||
        e.categoryId === 'cat_suspension_steering' ||
        e.categoryId === 'cat_breakdown_emergency' ||
        e.categoryId === 'cat_labour_workshop' ||
        e.categoryId === 'cat_spare_parts'
      ) {
        repairExpense += e.amount;
      } else {
        otherExpense += e.amount;
      }
    });

    // Maintenance summary counts
    const upcomingCount = reminders.filter((r) => r.status === 'Upcoming').length;
    const dueSoonCount = reminders.filter((r) => r.status === 'Due Soon' || r.status === 'Due').length;
    const overdueCount = reminders.filter((r) => r.status === 'Overdue').length;
    const totalRecords = this.getMaintenanceRecords(undefined, userId).length;

    const maintenanceCounts = {
      upcoming: upcomingCount,
      dueSoon: dueSoonCount,
      overdue: overdueCount,
    };

    // Vehicle Summaries:
    // For each vehicle: Total expense, Fuel expense, Maintenance expense, Repair expense, Current KM, Current operating hours
    const vehicleSummaries: VehicleExpenseSummary[] = vehicles.map((veh) => {
      const vehExpenses = expenses.filter((e) => e.vehicleId === veh.vehicleId);
      let vTotalExpense = 0;
      let vFuelExpense = 0;
      let vMaintenanceExpense = 0;
      let vRepairExpense = 0;

      vehExpenses.forEach((e) => {
        vTotalExpense += e.amount;
        if (e.categoryId === 'cat_fuel') {
          vFuelExpense += e.amount;
        } else if (e.categoryId === 'cat_periodic_service' || e.categoryId === 'cat_engine_fluids') {
          vMaintenanceExpense += e.amount;
        } else if (
          e.categoryId === 'cat_brakes' ||
          e.categoryId === 'cat_engine_transmission' ||
          e.categoryId === 'cat_suspension_steering' ||
          e.categoryId === 'cat_breakdown_emergency' ||
          e.categoryId === 'cat_labour_workshop' ||
          e.categoryId === 'cat_spare_parts'
        ) {
          vRepairExpense += e.amount;
        }
      });

      return {
        vehicleId: veh.vehicleId,
        vehicleName: veh.vehicleName,
        vehicleNumber: veh.vehicleNumber,
        vehicleType: veh.vehicleType,
        fuelType: veh.fuelType,
        totalExpense: vTotalExpense,
        fuelExpense: vFuelExpense,
        maintenanceExpense: vMaintenanceExpense,
        repairExpense: vRepairExpense,
        currentKm: veh.currentOdometer,
        currentHours: veh.currentOperatingHours,
        expenseCount: vehExpenses.length,
      };
    });

    return {
      todayTotal,
      thisWeekTotal,
      thisMonthTotal,
      totalExpense: totalAllTime,
      totalAllTime,
      fuelExpense,
      maintenanceExpense,
      repairExpense,
      otherExpense,
      totalVehicles: vehicles.length,
      upcomingMaintenance: upcomingCount,
      dueMaintenance: dueSoonCount,
      overdueMaintenance: overdueCount,
      totalMaintenanceRecords: totalRecords,
      maintenanceCounts,
      vehicleSummaries,
    };
  },

  // -------------------------------------------------------------
  // REPORTING CALCULATIONS (Requirement 12)
  // -------------------------------------------------------------
  getReportingData(userId: string = this.getCurrentUserId(), filterVehicleId?: string) {
    let expenses = this.getExpenses(undefined, userId);
    if (filterVehicleId) {
      expenses = expenses.filter((e) => e.vehicleId === filterVehicleId);
    }

    const categories = this.getCategories();
    const catMap = new Map<string, ExpenseCategory>(categories.map((c) => [c.categoryId, c]));
    const subcats = this.getSubcategories();
    const subcatMap = new Map<string, ExpenseSubcategory>(subcats.map((s) => [s.subcategoryId, s]));

    // 1. Expense by Category
    const categoryTotals = new Map<string, { categoryId: string; name: string; amount: number; count: number }>();
    expenses.forEach((e) => {
      const cat = catMap.get(e.categoryId);
      const name = cat ? cat.name : 'Other';
      const existing = categoryTotals.get(e.categoryId) || { categoryId: e.categoryId, name, amount: 0, count: 0 };
      existing.amount += e.amount;
      existing.count += 1;
      categoryTotals.set(e.categoryId, existing);
    });
    const expenseByCategory = Array.from(categoryTotals.values()).sort((a, b) => b.amount - a.amount);

    // 2. Expense by Subcategory
    const subcatTotals = new Map<string, { subcategoryId: string; name: string; categoryName: string; amount: number; count: number }>();
    expenses.forEach((e) => {
      const sub = subcatMap.get(e.subcategoryId);
      const cat = catMap.get(e.categoryId);
      const name = sub ? sub.name : 'General';
      const categoryName = cat ? cat.name : 'Other';
      const existing = subcatTotals.get(e.subcategoryId) || {
        subcategoryId: e.subcategoryId,
        name,
        categoryName,
        amount: 0,
        count: 0,
      };
      existing.amount += e.amount;
      existing.count += 1;
      subcatTotals.set(e.subcategoryId, existing);
    });
    const expenseBySubcategory = Array.from(subcatTotals.values()).sort((a, b) => b.amount - a.amount);

    // 3. Weekly Report (Last 8 calendar weeks)
    const weeklyTotalsMap = new Map<string, number>();
    expenses.forEach((e) => {
      const d = new Date(e.date);
      // Determine week start (Monday)
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(d.setDate(diff)).toISOString().split('T')[0];
      const key = `Week of ${weekStart}`;
      weeklyTotalsMap.set(key, (weeklyTotalsMap.get(key) || 0) + e.amount);
    });
    const weeklyReport = Array.from(weeklyTotalsMap.entries()).map(([label, total]) => ({ label, total }));

    // 4. Monthly Report (Grouped by YYYY-MM)
    const monthlyTotalsMap = new Map<string, number>();
    expenses.forEach((e) => {
      const key = e.date.substring(0, 7); // e.g. 2026-09
      monthlyTotalsMap.set(key, (monthlyTotalsMap.get(key) || 0) + e.amount);
    });
    const monthlyReport = Array.from(monthlyTotalsMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, total]) => {
        const [year, m] = month.split('-');
        const dateObj = new Date(parseInt(year), parseInt(m) - 1, 1);
        const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        return { month, label, total };
      });

    // 5. Yearly Report
    const yearlyTotalsMap = new Map<string, number>();
    expenses.forEach((e) => {
      const year = e.date.substring(0, 4);
      yearlyTotalsMap.set(year, (yearlyTotalsMap.get(year) || 0) + e.amount);
    });
    const yearlyReport = Array.from(yearlyTotalsMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([year, total]) => ({ year, total }));

    // 6. Maintenance Cost Report:
    // Shows: Maintenance Type, Number of Services, Total Cost, Average Cost
    const records = this.getMaintenanceRecords(filterVehicleId, userId);
    const mTypes = this.getMaintenanceTypes();
    const mTypeMap = new Map<string, string>(mTypes.map((t) => [t.maintenanceTypeId, t.name]));

    const maintenanceReportMap = new Map<string, { maintenanceTypeId: string; name: string; serviceCount: number; totalCost: number }>();
    records.forEach((r) => {
      const name = mTypeMap.get(r.maintenanceTypeId) || 'Custom Service';
      const existing = maintenanceReportMap.get(r.maintenanceTypeId) || {
        maintenanceTypeId: r.maintenanceTypeId,
        name,
        serviceCount: 0,
        totalCost: 0,
      };
      existing.serviceCount += 1;
      existing.totalCost += r.cost;
      maintenanceReportMap.set(r.maintenanceTypeId, existing);
    });

    const maintenanceCostReport = Array.from(maintenanceReportMap.values()).map((item) => ({
      ...item,
      averageCost: item.serviceCount > 0 ? item.totalCost / item.serviceCount : 0,
    })).sort((a, b) => b.totalCost - a.totalCost);

    return {
      expenseByCategory,
      expenseBySubcategory,
      weeklyReport,
      monthlyReport,
      yearlyReport,
      maintenanceCostReport,
    };
  },

  // -------------------------------------------------------------
  // BACKUP, RESTORE & EXPORT (Requirement 17)
  // -------------------------------------------------------------
  exportDatabaseJSON(): string {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      users: getFromStorage(STORAGE_KEYS.USERS, []),
      vehicles: getFromStorage(STORAGE_KEYS.VEHICLES, []),
      categories: getFromStorage(STORAGE_KEYS.CATEGORIES, []),
      subcategories: getFromStorage(STORAGE_KEYS.SUBCATEGORIES, []),
      expenses: getFromStorage(STORAGE_KEYS.EXPENSES, []),
      maintenanceTypes: getFromStorage(STORAGE_KEYS.MAINTENANCE_TYPES, []),
      maintenanceSchedules: getFromStorage(STORAGE_KEYS.MAINTENANCE_SCHEDULES, []),
      maintenanceRecords: getFromStorage(STORAGE_KEYS.MAINTENANCE_RECORDS, []),
      reminders: getFromStorage(STORAGE_KEYS.REMINDERS, []),
    };
    return JSON.stringify(backup, null, 2);
  },

  importDatabaseJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.users) saveToStorage(STORAGE_KEYS.USERS, data.users);
      if (data.vehicles) saveToStorage(STORAGE_KEYS.VEHICLES, data.vehicles);
      if (data.categories) saveToStorage(STORAGE_KEYS.CATEGORIES, data.categories);
      if (data.subcategories) saveToStorage(STORAGE_KEYS.SUBCATEGORIES, data.subcategories);
      if (data.expenses) saveToStorage(STORAGE_KEYS.EXPENSES, data.expenses);
      if (data.maintenanceTypes) saveToStorage(STORAGE_KEYS.MAINTENANCE_TYPES, data.maintenanceTypes);
      if (data.maintenanceSchedules) saveToStorage(STORAGE_KEYS.MAINTENANCE_SCHEDULES, data.maintenanceSchedules);
      if (data.maintenanceRecords) saveToStorage(STORAGE_KEYS.MAINTENANCE_RECORDS, data.maintenanceRecords);
      if (data.reminders) saveToStorage(STORAGE_KEYS.REMINDERS, data.reminders);
      notify();
      return true;
    } catch (e) {
      console.error('Failed to import database:', e);
      return false;
    }
  },

  resetDemoData(): void {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.VEHICLES);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.SUBCATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.MAINTENANCE_TYPES);
    localStorage.removeItem(STORAGE_KEYS.MAINTENANCE_SCHEDULES);
    localStorage.removeItem(STORAGE_KEYS.MAINTENANCE_RECORDS);
    localStorage.removeItem(STORAGE_KEYS.REMINDERS);
    initializeStorageIfEmpty();
    notify();
  },

  exportExpensesCSV(userId: string = this.getCurrentUserId()): string {
    const expenses = this.getExpenses(undefined, userId);
    const vehicles = this.getVehicles(userId);
    const vehMap = new Map<string, Vehicle>(vehicles.map((v) => [v.vehicleId, v]));
    const categories = this.getCategories();
    const catMap = new Map<string, string>(categories.map((c) => [c.categoryId, c.name]));
    const subcats = this.getSubcategories();
    const subMap = new Map<string, string>(subcats.map((s) => [s.subcategoryId, s.name]));

    const headers = [
      'Expense ID',
      'Vehicle Name',
      'Vehicle Number',
      'Date',
      'Category',
      'Subcategory',
      'Amount',
      'Odometer',
      'Operating Hours',
      'Payment Method',
      'Vendor Name',
      'Invoice Number',
      'Description',
    ];

    const rows = expenses.map((e) => {
      const veh = vehMap.get(e.vehicleId);
      return [
        `"${e.expenseId}"`,
        `"${veh?.vehicleName || ''}"`,
        `"${veh?.vehicleNumber || ''}"`,
        `"${e.date}"`,
        `"${catMap.get(e.categoryId) || e.categoryId}"`,
        `"${subMap.get(e.subcategoryId) || e.subcategoryId}"`,
        e.amount.toFixed(2),
        e.odometer,
        e.operatingHours,
        `"${e.paymentMethod}"`,
        `"${e.vendorName || ''}"`,
        `"${e.invoiceNumber || ''}"`,
        `"${(e.description || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  },

  subscribe(listener: Listener): () => void {
    return subscribeToStore(listener);
  },

  exportAllDataJSON(): string {
    return this.exportDatabaseJSON();
  },

  importDataJSON(jsonString: string): { success: boolean; error?: string } {
    const success = this.importDatabaseJSON(jsonString);
    return { success, error: success ? undefined : 'Invalid JSON backup format' };
  },

  resetToDefaultData(): void {
    this.resetDemoData();
  },
};
