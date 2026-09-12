import React, { useState, useEffect } from 'react';
import { X, Wrench, Calendar, Gauge, Clock, Bell, AlertCircle } from 'lucide-react';
import { db } from '../services/db';
import { MaintenanceSchedule, MaintenanceType, Vehicle } from '../types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSchedule?: MaintenanceSchedule | null;
  vehicles: Vehicle[];
  maintenanceTypes: MaintenanceType[];
  defaultVehicleId?: string;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  editingSchedule,
  vehicles,
  maintenanceTypes,
  defaultVehicleId,
}) => {
  const [vehicleId, setVehicleId] = useState('');
  const [maintenanceTypeId, setMaintenanceTypeId] = useState('');
  const [customName, setCustomName] = useState('');
  const [intervalKilometers, setIntervalKilometers] = useState<number>(5000);
  const [intervalDays, setIntervalDays] = useState<number>(180);
  const [intervalHours, setIntervalHours] = useState<number>(150);
  const [advanceNoticeKilometers, setAdvanceNoticeKilometers] = useState<number>(500);
  const [advanceNoticeDays, setAdvanceNoticeDays] = useState<number>(14);
  const [advanceNoticeHours, setAdvanceNoticeHours] = useState<number>(20);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingSchedule) {
      setVehicleId(editingSchedule.vehicleId);
      setMaintenanceTypeId(editingSchedule.maintenanceTypeId);
      setCustomName(editingSchedule.customName || '');
      setIntervalKilometers(editingSchedule.intervalKilometers);
      setIntervalDays(editingSchedule.intervalDays);
      setIntervalHours(editingSchedule.intervalHours);
      setAdvanceNoticeKilometers(editingSchedule.advanceNoticeKilometers);
      setAdvanceNoticeDays(editingSchedule.advanceNoticeDays);
      setAdvanceNoticeHours(editingSchedule.advanceNoticeHours);
      setErrorMsg(null);
    } else {
      const initVeh = defaultVehicleId && defaultVehicleId !== 'ALL'
        ? defaultVehicleId
        : (vehicles[0]?.vehicleId || '');
      setVehicleId(initVeh);

      const initType = maintenanceTypes[0];
      if (initType) {
        setMaintenanceTypeId(initType.maintenanceTypeId);
        setIntervalKilometers(initType.defaultIntervalKilometers);
        setIntervalDays(initType.defaultIntervalDays);
        setIntervalHours(initType.defaultIntervalHours);
      }
      setCustomName('');
      setAdvanceNoticeKilometers(500);
      setAdvanceNoticeDays(14);
      setAdvanceNoticeHours(20);
      setErrorMsg(null);
    }
  }, [editingSchedule, isOpen, defaultVehicleId, vehicles, maintenanceTypes]);

  const handleTypeChange = (newTypeId: string) => {
    setMaintenanceTypeId(newTypeId);
    const mType = maintenanceTypes.find((t) => t.maintenanceTypeId === newTypeId);
    if (mType) {
      setIntervalKilometers(mType.defaultIntervalKilometers);
      setIntervalDays(mType.defaultIntervalDays);
      setIntervalHours(mType.defaultIntervalHours);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!vehicleId) {
      setErrorMsg('Please select a vehicle.');
      return;
    }

    if (!maintenanceTypeId) {
      setErrorMsg('Please select a maintenance service type.');
      return;
    }

    if (intervalKilometers <= 0 && intervalDays <= 0 && intervalHours <= 0) {
      setErrorMsg('At least one interval (KM, Days, or Hours) must be greater than zero.');
      return;
    }

    try {
      if (editingSchedule) {
        db.updateMaintenanceSchedule(editingSchedule.scheduleId, {
          vehicleId,
          maintenanceTypeId,
          customName: customName.trim() || undefined,
          intervalKilometers: Number(intervalKilometers),
          intervalDays: Number(intervalDays),
          intervalHours: Number(intervalHours),
          reminderKmBefore: Number(advanceNoticeKilometers),
          reminderDaysBefore: Number(advanceNoticeDays),
          reminderHoursBefore: Number(advanceNoticeHours),
        });
      } else {
        const targetVeh = vehicles.find((v) => v.vehicleId === vehicleId);
        const currentKm = targetVeh ? targetVeh.currentOdometer : 0;
        const currentHours = targetVeh ? targetVeh.currentOperatingHours : 0;
        const today = new Date();
        const nextDateObj = new Date(today.getTime() + intervalDays * 24 * 60 * 60 * 1000);

        db.createMaintenanceSchedule({
          vehicleId,
          maintenanceTypeId,
          customName: customName.trim() || undefined,
          intervalKilometers: Number(intervalKilometers),
          intervalDays: Number(intervalDays),
          intervalHours: Number(intervalHours),
          lastServiceDate: today.toISOString().slice(0, 10),
          lastServiceOdometer: currentKm,
          lastServiceHours: currentHours,
          nextDueDate: nextDateObj.toISOString().slice(0, 10),
          nextDueOdometer: currentKm + Number(intervalKilometers),
          nextDueHours: currentHours + Number(intervalHours),
          reminderKmBefore: Number(advanceNoticeKilometers),
          reminderDaysBefore: Number(advanceNoticeDays),
          reminderHoursBefore: Number(advanceNoticeHours),
          estimatedCost: 120,
          isActive: true,
        });
      }

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save maintenance schedule');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl text-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-800/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {editingSchedule ? 'Edit Maintenance Schedule' : 'Create Maintenance Schedule'}
              </h3>
              <p className="text-xs text-slate-400">
                Automated recurring intervals for engine oil, tires, filters, and safety inspections
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Vehicle and Service Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Vehicle *</label>
              <select
                required
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                {vehicles.map((v) => (
                  <option key={v.vehicleId} value={v.vehicleId}>
                    {v.vehicleName} ({v.vehicleNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Service Type *</label>
              <select
                required
                value={maintenanceTypeId}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                {maintenanceTypes.map((t) => (
                  <option key={t.maintenanceTypeId} value={t.maintenanceTypeId}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Name Override */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Custom Service Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. 5,000 KM Full Synthetic Engine Oil & Filter Change"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Recurring Interval Thresholds */}
          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Recurring Service Intervals (Next-Due Formula)
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 flex items-center space-x-1">
                  <Gauge className="w-3 h-3 text-blue-400" />
                  <span>Interval (KM)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={intervalKilometers}
                  onChange={(e) => setIntervalKilometers(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1 flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-emerald-400" />
                  <span>Interval (Days)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={intervalDays}
                  onChange={(e) => setIntervalDays(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Interval (Hours)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={intervalHours}
                  onChange={(e) => setIntervalHours(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Advance Notice Window */}
          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Advance Notice Thresholds (Triggers "Due Soon")</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Notice (KM)</label>
                <input
                  type="number"
                  min="0"
                  value={advanceNoticeKilometers}
                  onChange={(e) => setAdvanceNoticeKilometers(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Notice (Days)</label>
                <input
                  type="number"
                  min="0"
                  value={advanceNoticeDays}
                  onChange={(e) => setAdvanceNoticeDays(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Notice (Hours)</label>
                <input
                  type="number"
                  min="0"
                  value={advanceNoticeHours}
                  onChange={(e) => setAdvanceNoticeHours(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs transition"
            >
              {editingSchedule ? 'Save Changes' : 'Create Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
