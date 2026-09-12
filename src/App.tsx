import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { VehiclesView } from './components/VehiclesView';
import { ExpensesView } from './components/ExpensesView';
import { MaintenanceView } from './components/MaintenanceView';
import { RemindersView } from './components/RemindersView';
import { ReportsView } from './components/ReportsView';
import { CategoriesView } from './components/CategoriesView';
import { ArchitectureView } from './components/ArchitectureView';
import { ExpenseModal } from './components/ExpenseModal';
import { VehicleModal } from './components/VehicleModal';
import { ScheduleModal } from './components/ScheduleModal';
import { CompleteServiceModal } from './components/CompleteServiceModal';
import { 
  Expense, 
  ExpenseCategory, 
  ExpenseSubcategory, 
  MaintenanceRecord, 
  MaintenanceSchedule, 
  MaintenanceType, 
  Reminder, 
  User, 
  Vehicle 
} from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(db.getCurrentUser());
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [vehicles, setVehicles] = useState<Vehicle[]>(db.getVehicles());
  const [categories, setCategories] = useState<ExpenseCategory[]>(db.getCategories());
  const [subcategories, setSubcategories] = useState<ExpenseSubcategory[]>(db.getSubcategories());
  const [maintenanceTypes, setMaintenanceTypes] = useState<MaintenanceType[]>(db.getMaintenanceTypes());
  const [expenses, setExpenses] = useState<Expense[]>(db.getExpenses());
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>(db.getMaintenanceSchedules());
  const [records, setRecords] = useState<MaintenanceRecord[]>(db.getMaintenanceRecords());
  const [reminders, setReminders] = useState<Reminder[]>(db.getReminders());
  const [metrics, setMetrics] = useState(db.getDashboardMetrics());

  // Navigation and Filter States
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedVehicleId, setSelectedVehicleId] = useState('ALL');

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<MaintenanceSchedule | null>(null);

  const [isCompleteServiceModalOpen, setIsCompleteServiceModalOpen] = useState(false);
  const [completingSchedule, setCompletingSchedule] = useState<MaintenanceSchedule | null>(null);

  // Subscribe to real-time changes in local database
  useEffect(() => {
    const refreshAll = () => {
      setCurrentUser(db.getCurrentUser());
      setUsers(db.getUsers());
      setVehicles(db.getVehicles());
      setCategories(db.getCategories());
      setSubcategories(db.getSubcategories());
      setMaintenanceTypes(db.getMaintenanceTypes());
      setExpenses(db.getExpenses());
      setSchedules(db.getMaintenanceSchedules());
      setRecords(db.getMaintenanceRecords());
      setReminders(db.getReminders());
      setMetrics(db.getDashboardMetrics());
    };

    const unsubscribe = db.subscribe(refreshAll);
    refreshAll();

    return () => {
      unsubscribe();
    };
  }, []);

  // Handlers for Opening Modals
  const handleOpenNewExpense = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleOpenNewVehicle = () => {
    setEditingVehicle(null);
    setIsVehicleModalOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsVehicleModalOpen(true);
  };

  const handleOpenNewSchedule = () => {
    setEditingSchedule(null);
    setIsScheduleModalOpen(true);
  };

  const handleEditSchedule = (schedule: MaintenanceSchedule) => {
    setEditingSchedule(schedule);
    setIsScheduleModalOpen(true);
  };

  const handleOpenCompleteService = (schedule: MaintenanceSchedule) => {
    setCompletingSchedule(schedule);
    setIsCompleteServiceModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header & Global Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        users={users}
        vehicles={vehicles}
        selectedVehicleId={selectedVehicleId}
        setSelectedVehicleId={setSelectedVehicleId}
        overdueCount={metrics.maintenanceCounts.overdue}
        dueSoonCount={metrics.maintenanceCounts.dueSoon}
        onOpenNewExpense={handleOpenNewExpense}
        onOpenNewVehicle={handleOpenNewVehicle}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            metrics={metrics}
            recentExpenses={expenses.slice(0, 10)}
            reminders={reminders}
            onOpenNewExpense={handleOpenNewExpense}
            onOpenNewVehicle={handleOpenNewVehicle}
            onOpenNewSchedule={handleOpenNewSchedule}
            onNavigateTab={setCurrentTab}
            onSelectVehicle={setSelectedVehicleId}
          />
        )}

        {currentTab === 'vehicles' && (
          <VehiclesView
            vehicles={vehicles}
            onOpenNewVehicle={handleOpenNewVehicle}
            onEditVehicle={handleEditVehicle}
            onSelectVehicle={setSelectedVehicleId}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            vehicles={vehicles}
            categories={categories}
            subcategories={subcategories}
            selectedVehicleId={selectedVehicleId}
            onOpenNewExpense={handleOpenNewExpense}
            onEditExpense={handleEditExpense}
          />
        )}

        {currentTab === 'maintenance' && (
          <MaintenanceView
            schedules={schedules}
            records={records}
            vehicles={vehicles}
            maintenanceTypes={maintenanceTypes}
            selectedVehicleId={selectedVehicleId}
            onOpenNewSchedule={handleOpenNewSchedule}
            onOpenCompleteService={handleOpenCompleteService}
            onEditSchedule={handleEditSchedule}
          />
        )}

        {currentTab === 'reminders' && (
          <RemindersView
            reminders={reminders}
            vehicles={vehicles}
            schedules={schedules}
            selectedVehicleId={selectedVehicleId}
            onOpenCompleteService={handleOpenCompleteService}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            vehicles={vehicles}
            vehicleSummaries={metrics.vehicleSummaries}
            selectedVehicleId={selectedVehicleId}
          />
        )}

        {currentTab === 'categories' && (
          <CategoriesView
            categories={categories}
            subcategories={subcategories}
          />
        )}

        {currentTab === 'architecture' && (
          <ArchitectureView />
        )}
      </main>

      {/* Footer info banner */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Vehicle Expense & Maintenance Management System • Multi-Tenant Isolated Architecture
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>Active Tenant: <strong className="text-slate-300">{currentUser.name}</strong></span>
            <span>•</span>
            <span>Vehicles: <strong className="text-slate-300">{vehicles.length}</strong></span>
          </div>
        </div>
      </footer>

      {/* Modal Dialogs */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        editingExpense={editingExpense}
        vehicles={vehicles}
        categories={categories}
        subcategories={subcategories}
        defaultVehicleId={selectedVehicleId}
      />

      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        editingVehicle={editingVehicle}
      />

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        editingSchedule={editingSchedule}
        vehicles={vehicles}
        maintenanceTypes={maintenanceTypes}
        defaultVehicleId={selectedVehicleId}
      />

      <CompleteServiceModal
        isOpen={isCompleteServiceModalOpen}
        onClose={() => setIsCompleteServiceModalOpen(false)}
        schedule={completingSchedule}
        vehicles={vehicles}
      />
    </div>
  );
}
