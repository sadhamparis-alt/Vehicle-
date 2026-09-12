import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  RefreshCw, 
  Car, 
  Gauge, 
  Calendar, 
  Check, 
  Trash2,
  AlertOctagon
} from 'lucide-react';
import { db } from '../services/db';
import { MaintenanceSchedule, Reminder, ReminderStatus, Vehicle } from '../types';

interface RemindersViewProps {
  reminders: Reminder[];
  vehicles: Vehicle[];
  schedules: MaintenanceSchedule[];
  selectedVehicleId: string;
  onOpenCompleteService: (schedule: MaintenanceSchedule) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  vehicles,
  schedules,
  selectedVehicleId,
  onOpenCompleteService,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [filterVehicle, setFilterVehicle] = useState<string>(selectedVehicleId || 'ALL');

  React.useEffect(() => {
    if (selectedVehicleId) {
      setFilterVehicle(selectedVehicleId);
    }
  }, [selectedVehicleId]);

  const vehMap = new Map<string, Vehicle>(vehicles.map((v) => [v.vehicleId, v]));
  const schedMap = new Map<string, MaintenanceSchedule>(schedules.map((s) => [s.scheduleId, s]));

  const filteredReminders = reminders.filter((r) => {
    if (filterVehicle !== 'ALL' && r.vehicleId !== filterVehicle) return false;
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  });

  const overdueCount = reminders.filter((r) => r.status === 'Overdue').length;
  const dueSoonCount = reminders.filter((r) => r.status === 'Due Soon' || r.status === 'Due').length;
  const upcomingCount = reminders.filter((r) => r.status === 'Upcoming').length;

  const handleDismiss = (reminderId: string) => {
    db.updateReminderStatus(reminderId, 'Dismissed');
  };

  const handleCompleteClick = (r: Reminder) => {
    const sched = schedMap.get(r.scheduleId);
    if (sched) {
      onOpenCompleteService(sched);
    } else {
      // Create a fallback schedule object if scheduleId was deleted
      const veh = vehMap.get(r.vehicleId);
      const fallbackSched: MaintenanceSchedule = {
        scheduleId: r.scheduleId || `sched_${Date.now()}`,
        userId: r.userId,
        vehicleId: r.vehicleId,
        maintenanceTypeId: 'mt_oil',
        customName: r.title,
        intervalKilometers: 5000,
        intervalDays: 180,
        intervalHours: 150,
        lastServiceDate: r.dueDate,
        lastServiceOdometer: r.dueOdometer,
        lastServiceHours: r.dueHours,
        nextDueDate: r.dueDate,
        nextDueOdometer: r.dueOdometer,
        nextDueHours: r.dueHours,
        reminderKmBefore: 500,
        reminderDaysBefore: 14,
        reminderHoursBefore: 20,
        estimatedCost: 100,
        isActive: true,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
      onOpenCompleteService(fallbackSched);
    }
  };

  const handleManualRefresh = () => {
    db.refreshRemindersForUser();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <span>Automated Maintenance Reminders</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time threshold engine: checks current vs due dates, kilometers, and operating hours
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={handleManualRefresh}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
            title="Recalculate reminders against latest vehicle odometer and hours"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Recalculate Thresholds</span>
          </button>
        </div>
      </div>

      {/* KPI Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setStatusFilter(statusFilter === 'Overdue' ? 'ALL' : 'Overdue')}
          className={`p-4 rounded-xl border text-left transition flex items-center justify-between ${
            statusFilter === 'Overdue'
              ? 'bg-red-500/20 border-red-500 text-red-200'
              : 'bg-slate-900 border-slate-800 hover:border-red-500/40'
          }`}
        >
          <div>
            <div className="text-xs font-semibold text-red-400 uppercase tracking-wider">Overdue Alerts</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{overdueCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Threshold exceeded (KM, Date, or Hours)</div>
          </div>
          <AlertOctagon className="w-8 h-8 text-red-400" />
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'Due Soon' ? 'ALL' : 'Due Soon')}
          className={`p-4 rounded-xl border text-left transition flex items-center justify-between ${
            statusFilter === 'Due Soon'
              ? 'bg-amber-500/20 border-amber-500 text-amber-200'
              : 'bg-slate-900 border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <div>
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Due Soon</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{dueSoonCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Within advance notice window</div>
          </div>
          <Clock className="w-8 h-8 text-amber-400" />
        </button>

        <button
          onClick={() => setStatusFilter(statusFilter === 'Upcoming' ? 'ALL' : 'Upcoming')}
          className={`p-4 rounded-xl border text-left transition flex items-center justify-between ${
            statusFilter === 'Upcoming'
              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
              : 'bg-slate-900 border-slate-800 hover:border-emerald-500/40'
          }`}
        >
          <div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Upcoming</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{upcomingCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Beyond notice window, monitored</div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </button>
      </div>

      {/* Filter and Switchers */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
          {['ALL', 'Overdue', 'Due Soon', 'Upcoming', 'Completed', 'Dismissed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Vehicle Filter */}
        <select
          value={filterVehicle}
          onChange={(e) => setFilterVehicle(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg focus:outline-none w-full sm:w-auto"
        >
          <option value="ALL">All Vehicles ({vehicles.length})</option>
          {vehicles.map((v) => (
            <option key={v.vehicleId} value={v.vehicleId}>
              {v.vehicleName} ({v.vehicleNumber})
            </option>
          ))}
        </select>
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-500/40 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">
            {reminders.length === 0 ? 'No upcoming maintenance.' : 'No matching reminders'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {reminders.length === 0
              ? 'No upcoming maintenance reminders scheduled yet. Add vehicle maintenance schedules to track intervals.'
              : statusFilter !== 'ALL' || filterVehicle !== 'ALL'
              ? 'No reminders match your current filter settings.'
              : 'All vehicle maintenance is currently up to date. The system continuously monitors vehicle kilometers and operating hours.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReminders.map((rem) => {
            const veh = vehMap.get(rem.vehicleId);
            const isOverdue = rem.status === 'Overdue';
            const isDueSoon = rem.status === 'Due Soon' || rem.status === 'Due';
            const isCompleted = rem.status === 'Completed';
            const isDismissed = rem.status === 'Dismissed';

            const currentKm = veh?.currentOdometer || 0;
            const currentHours = veh?.currentOperatingHours || 0;

            return (
              <div
                key={rem.reminderId}
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                  isOverdue
                    ? 'bg-red-500/10 border-red-500/30'
                    : isDueSoon
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : isCompleted
                    ? 'bg-slate-900 border-slate-800 opacity-70'
                    : isDismissed
                    ? 'bg-slate-900 border-slate-800 opacity-60'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-100">{rem.title}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isOverdue
                          ? 'bg-red-500 text-white'
                          : isDueSoon
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isDismissed
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {rem.status}
                    </span>

                    <span className="text-xs text-slate-400 flex items-center space-x-1">
                      <Car className="w-3.5 h-3.5 text-slate-500" />
                      <span>{veh?.vehicleName} ({veh?.vehicleNumber})</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">{rem.message}</p>

                  {/* Telemetry Comparison: Current vs Due */}
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>Due: <strong className="text-slate-200">{rem.dueDate}</strong></span>
                    </span>

                    <span className="flex items-center space-x-1">
                      <Gauge className="w-3 h-3 text-slate-500" />
                      <span>Due: <strong className="text-slate-200">{rem.dueOdometer.toLocaleString()} KM</strong> (Current: {currentKm.toLocaleString()} KM)</span>
                    </span>

                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>Due: <strong className="text-slate-200">{rem.dueHours} hrs</strong> (Current: {currentHours} hrs)</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                  {!isCompleted && (
                    <button
                      onClick={() => handleCompleteClick(rem)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete Service</span>
                    </button>
                  )}

                  {!isDismissed && !isCompleted && (
                    <button
                      onClick={() => handleDismiss(rem.reminderId)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs rounded-lg border border-slate-700 transition"
                      title="Dismiss reminder"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
