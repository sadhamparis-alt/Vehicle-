import React from 'react';
import { 
  Calendar, 
  TrendingUp, 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  Fuel, 
  Wrench, 
  Gauge, 
  Car, 
  Plus, 
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Activity,
  Layers,
  FileText,
  Sparkles,
  PieChart,
  Hammer
} from 'lucide-react';
import { DashboardMetrics, Expense, Reminder, VehicleExpenseSummary } from '../types';
import { formatCurrency, formatKm, formatHours } from '../utils/format';

interface DashboardViewProps {
  metrics: DashboardMetrics;
  recentExpenses: Expense[];
  reminders: Reminder[];
  onOpenNewExpense: () => void;
  onOpenNewVehicle: () => void;
  onOpenNewSchedule?: () => void;
  onNavigateTab: (tab: string) => void;
  onSelectVehicle: (vehicleId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  recentExpenses,
  reminders,
  onOpenNewExpense,
  onOpenNewVehicle,
  onOpenNewSchedule,
  onNavigateTab,
  onSelectVehicle,
}) => {
  const {
    totalExpense = 0,
    thisWeekTotal = 0,
    thisMonthTotal = 0,
    todayTotal = 0,
    fuelExpense = 0,
    maintenanceExpense = 0,
    repairExpense = 0,
    otherExpense = 0,
    totalVehicles = 0,
    upcomingMaintenance = 0,
    dueMaintenance = 0,
    overdueMaintenance = 0,
    totalMaintenanceRecords = 0,
    vehicleSummaries = [],
  } = metrics || {};

  const overdueReminders = reminders.filter((r) => r.status === 'Overdue');
  const dueSoonReminders = reminders.filter((r) => r.status === 'Due Soon' || r.status === 'Due');
  const isFirstUse = totalVehicles === 0;

  return (
    <div className="space-y-6">
      {/* 1. FIRST USE ONBOARDING FLOW BANNER */}
      {isFirstUse ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>First Use Setup</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
                Welcome to your Fleet Dashboard
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your account is fresh and ready. To begin logging expenses, tracking fuel refills, and setting up preventive service reminders, add your first vehicle.
              </p>

              {/* 3-Step Guided Workflow */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-slate-800/80 border border-emerald-500/50 rounded-xl p-3 flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <div>
                    <div className="font-semibold text-emerald-300">Add First Vehicle</div>
                    <div className="text-[11px] text-slate-400">Step 1: Required to unlock logging</div>
                  </div>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 flex items-start space-x-2.5 opacity-60">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <div>
                    <div className="font-semibold text-slate-300">Record Expenses</div>
                    <div className="text-[11px] text-slate-400">Step 2: Log fuel & repairs</div>
                  </div>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 flex items-start space-x-2.5 opacity-60">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <div>
                    <div className="font-semibold text-slate-300">Schedule Service</div>
                    <div className="text-[11px] text-slate-400">Step 3: Track due KM/hours</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <button
                id="btn-first-use-add-vehicle"
                onClick={onOpenNewVehicle}
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-2 transition active:scale-95"
              >
                <Plus className="w-5 h-5" />
                <span>Add Your First Vehicle</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Quick Action Bar for Existing Users */
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Fleet Overview</span>
            </h2>
            <p className="text-xs text-slate-400">
              Real-time expenditure summaries and service telemetry
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenNewExpense}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Expense</span>
            </button>
            <button
              onClick={onOpenNewVehicle}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
            >
              <Car className="w-3.5 h-3.5 text-blue-400" />
              <span>Add Vehicle</span>
            </button>
            {onOpenNewSchedule && (
              <button
                onClick={onOpenNewSchedule}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>New Schedule</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Overdue Alert Banner (Only when real overdue items exist) */}
      {overdueReminders.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-bold text-red-200">
                {overdueReminders.length} Maintenance Service{overdueReminders.length > 1 ? 's' : ''} Overdue!
              </div>
              <p className="text-xs text-red-300/80">
                Vehicle operating thresholds or due dates have been exceeded. Schedule service now.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('reminders')}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1 transition shrink-0"
          >
            <span>Review Alerts</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. PRIMARY TIME-BASED EXPENSE KPI ROW */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Period Expenditures
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Expense */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expense</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {formatCurrency(totalExpense)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              All-time total vehicle spending
            </div>
          </div>

          {/* This Month Expense */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">This Month</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-100">
              {formatCurrency(thisMonthTotal)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              1st to last day of current month
            </div>
          </div>

          {/* This Week Expense */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">This Week</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-100">
              {formatCurrency(thisWeekTotal)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Monday through Sunday
            </div>
          </div>

          {/* Today's Expense */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Expense</span>
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-100">
              {formatCurrency(todayTotal)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Recorded for current calendar date
            </div>
          </div>
        </div>
      </div>

      {/* 3. CATEGORY EXPENSE BREAKDOWN KPI ROW */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Category Spending Breakdown
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Fuel Expense */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fuel Expense</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Fuel className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-amber-300">
              {formatCurrency(fuelExpense)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Petrol, Diesel, CNG, & EV charging
            </div>
          </div>

          {/* Maintenance Expense */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Maintenance</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-blue-300">
              {formatCurrency(maintenanceExpense)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Periodic inspections & engine fluids
            </div>
          </div>

          {/* Repair Expense */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Repair Expense</span>
              <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                <Hammer className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-red-300">
              {formatCurrency(repairExpense)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Brakes, transmission, & breakdown
            </div>
          </div>

          {/* Other Expense */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Other Expense</span>
              <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-200">
              {formatCurrency(otherExpense)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Tolls, parking, insurance & misc
            </div>
          </div>
        </div>
      </div>

      {/* 4. FLEET & MAINTENANCE METRICS KPI ROW */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Fleet & Service Telemetry
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Total Vehicles */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Vehicles</span>
              <Car className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-100">{totalVehicles}</div>
            <div className="text-[10px] text-slate-500">Registered fleet</div>
          </div>

          {/* Upcoming Maintenance */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Upcoming</span>
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400">{upcomingMaintenance}</div>
            <div className="text-[10px] text-slate-500">Scheduled on track</div>
          </div>

          {/* Due Maintenance */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Due Soon</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-400">{dueMaintenance}</div>
            <div className="text-[10px] text-slate-500">Approaching threshold</div>
          </div>

          {/* Overdue Maintenance */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Overdue</span>
              <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="text-xl font-bold text-red-400">{overdueMaintenance}</div>
            <div className="text-[10px] text-slate-500">Requires immediate attention</div>
          </div>

          {/* Total Maintenance Records */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Service Logs</span>
              <FileText className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-blue-400">{totalMaintenanceRecords}</div>
            <div className="text-[10px] text-slate-500">Completed service history</div>
          </div>
        </div>
      </div>

      {/* 5. CHARTS / ANALYTICS SECTION (REAL DATA OR CLEAN ZERO-STATE) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <span>Expense Distribution</span>
          </h3>
          {totalExpense > 0 && (
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {totalExpense === 0 ? (
          <div className="text-center py-10 px-4 border border-dashed border-slate-800 rounded-xl">
            <PieChart className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-slate-300">No expense records yet</div>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Category distribution charts will automatically generate once you record your first vehicle expense.
            </p>
            <button
              onClick={totalVehicles > 0 ? onOpenNewExpense : onOpenNewVehicle}
              className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
            >
              {totalVehicles > 0 ? 'Log First Expense' : 'Add Vehicle First'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60">
                <div className="text-slate-400 mb-1">Fuel Share</div>
                <div className="text-lg font-bold text-amber-300">
                  {((fuelExpense / totalExpense) * 100).toFixed(1)}%
                </div>
                <div className="text-slate-300">{formatCurrency(fuelExpense)}</div>
              </div>

              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60">
                <div className="text-slate-400 mb-1">Maintenance Share</div>
                <div className="text-lg font-bold text-blue-300">
                  {((maintenanceExpense / totalExpense) * 100).toFixed(1)}%
                </div>
                <div className="text-slate-300">{formatCurrency(maintenanceExpense)}</div>
              </div>

              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60">
                <div className="text-slate-400 mb-1">Repairs Share</div>
                <div className="text-lg font-bold text-red-300">
                  {((repairExpense / totalExpense) * 100).toFixed(1)}%
                </div>
                <div className="text-slate-300">{formatCurrency(repairExpense)}</div>
              </div>

              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60">
                <div className="text-slate-400 mb-1">Other Share</div>
                <div className="text-lg font-bold text-slate-300">
                  {((otherExpense / totalExpense) * 100).toFixed(1)}%
                </div>
                <div className="text-slate-300">{formatCurrency(otherExpense)}</div>
              </div>
            </div>

            {/* Visual stacked bar */}
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden flex">
              {fuelExpense > 0 && (
                <div 
                  className="bg-amber-400 h-full" 
                  style={{ width: `${(fuelExpense / totalExpense) * 100}%` }}
                  title={`Fuel: ${formatCurrency(fuelExpense)}`}
                />
              )}
              {maintenanceExpense > 0 && (
                <div 
                  className="bg-blue-500 h-full" 
                  style={{ width: `${(maintenanceExpense / totalExpense) * 100}%` }}
                  title={`Maintenance: ${formatCurrency(maintenanceExpense)}`}
                />
              )}
              {repairExpense > 0 && (
                <div 
                  className="bg-red-500 h-full" 
                  style={{ width: `${(repairExpense / totalExpense) * 100}%` }}
                  title={`Repairs: ${formatCurrency(repairExpense)}`}
                />
              )}
              {otherExpense > 0 && (
                <div 
                  className="bg-slate-500 h-full" 
                  style={{ width: `${(otherExpense / totalExpense) * 100}%` }}
                  title={`Other: ${formatCurrency(otherExpense)}`}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* 6. FLEET & VEHICLE SUMMARY SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Car className="w-4 h-4 text-emerald-400" />
              <span>Fleet & Vehicle Expense Summary</span>
            </h2>
            <p className="text-xs text-slate-400">
              Fuel, maintenance, repair breakdown and active operational hours per vehicle
            </p>
          </div>
          <button
            onClick={onOpenNewVehicle}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Vehicle</span>
          </button>
        </div>

        {vehicleSummaries.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
            <Car className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-300">No vehicles added yet.</div>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add your first vehicle to start tracking expenses, fuel mileage, and preventive maintenance.
            </p>
            <button
              onClick={onOpenNewVehicle}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
            >
              Add Vehicle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicleSummaries.map((veh) => (
              <div
                key={veh.vehicleId}
                className="bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 rounded-xl p-4 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-slate-100">{veh.vehicleName}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-medium">
                          {veh.vehicleType}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-emerald-400 mt-0.5">{veh.vehicleNumber}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Total Spend</div>
                      <div className="text-base font-bold text-slate-100">
                        {formatCurrency(veh.totalExpense)}
                      </div>
                    </div>
                  </div>

                  {/* Operational Telemetry: Current KM & Hours */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-700/60 text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <Gauge className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatKm(veh.currentKm)}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatHours(veh.currentHours)}</span>
                    </div>
                  </div>

                  {/* Expense Breakdown Categories */}
                  <div className="mt-3 space-y-1.5 bg-slate-900/50 p-2.5 rounded-lg text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center space-x-1.5 text-slate-400">
                        <Fuel className="w-3.5 h-3.5 text-amber-400" />
                        <span>Fuel</span>
                      </span>
                      <span className="font-semibold text-slate-200">{formatCurrency(veh.fuelExpense)}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center space-x-1.5 text-slate-400">
                        <Wrench className="w-3.5 h-3.5 text-blue-400" />
                        <span>Maintenance</span>
                      </span>
                      <span className="font-semibold text-slate-200">{formatCurrency(veh.maintenanceExpense)}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-300">
                      <span className="flex items-center space-x-1.5 text-slate-400">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                        <span>Repair & Labour</span>
                      </span>
                      <span className="font-semibold text-slate-200">{formatCurrency(veh.repairExpense)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-700/50 flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">{veh.expenseCount} entries recorded</span>
                  <button
                    onClick={() => {
                      onSelectVehicle(veh.vehicleId);
                      onNavigateTab('expenses');
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1"
                  >
                    <span>View Records</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. RECENT REMINDERS & RECENT EXPENSES STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Reminders & Service Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Active Maintenance Reminders</span>
            </h3>
            <button
              onClick={() => onNavigateTab('reminders')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1"
            >
              <span>View All ({reminders.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {reminders.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500 space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
              <div className="text-slate-300 font-semibold">No upcoming maintenance.</div>
              <div>No maintenance schedules yet.</div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {reminders.slice(0, 5).map((rem) => {
                const isOverdue = rem.status === 'Overdue';
                const isDueSoon = rem.status === 'Due Soon' || rem.status === 'Due';

                return (
                  <div
                    key={rem.reminderId}
                    className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs ${
                      isOverdue
                        ? 'bg-red-500/10 border-red-500/30 text-red-200'
                        : isDueSoon
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-100 flex items-center space-x-2">
                        <span>{rem.title}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            isOverdue
                              ? 'bg-red-500 text-white'
                              : isDueSoon
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {rem.status}
                        </span>
                      </div>
                      <p className="text-[11px] opacity-80">{rem.message}</p>
                      <div className="text-[10px] opacity-60">
                        Due: {rem.dueDate} | {formatKm(rem.dueOdometer)} | {formatHours(rem.dueHours)}
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateTab('maintenance')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-md text-[11px] font-medium transition shrink-0"
                    >
                      Complete
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Expense Transactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Recent Expense Activity</span>
            </h3>
            <button
              onClick={() => onNavigateTab('expenses')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1"
            >
              <span>View All ({recentExpenses.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              No expenses recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {recentExpenses.slice(0, 5).map((exp) => (
                <div
                  key={exp.expenseId}
                  className="p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-lg flex items-center justify-between gap-3 text-xs transition"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-200">
                      {exp.description || 'Vehicle Expense'}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                      <span>{exp.date}</span>
                      <span>•</span>
                      <span>{exp.paymentMethod}</span>
                      {exp.vendorName && (
                        <>
                          <span>•</span>
                          <span>{exp.vendorName}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-slate-100">
                      {formatCurrency(exp.amount)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {formatKm(exp.odometer)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
