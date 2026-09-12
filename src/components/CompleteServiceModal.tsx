import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Calendar, Gauge, Clock, DollarSign, Wrench, FileText, Check, AlertCircle } from 'lucide-react';
import { db } from '../services/db';
import { MaintenanceSchedule, Vehicle } from '../types';

interface CompleteServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: MaintenanceSchedule | null;
  vehicles: Vehicle[];
}

export const CompleteServiceModal: React.FC<CompleteServiceModalProps> = ({
  isOpen,
  onClose,
  schedule,
  vehicles,
}) => {
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [odometer, setOdometer] = useState<number>(0);
  const [operatingHours, setOperatingHours] = useState<number>(0);
  const [cost, setCost] = useState<string>('0');
  const [serviceCenter, setServiceCenter] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [replacedParts, setReplacedParts] = useState('');
  const [logAsExpense, setLogAsExpense] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const targetVehicle = schedule ? vehicles.find((v) => v.vehicleId === schedule.vehicleId) : null;

  useEffect(() => {
    if (schedule && targetVehicle) {
      setServiceDate(new Date().toISOString().slice(0, 10));
      setOdometer(targetVehicle.currentOdometer);
      setOperatingHours(targetVehicle.currentOperatingHours);
      setCost('120.00');
      setServiceCenter('Certified Auto Care');
      setInvoiceNumber(`SRV-${Date.now().toString().slice(-5)}`);
      setNotes('');
      setReplacedParts('Filter, Engine Oil');
      setLogAsExpense(true);
      setErrorMsg(null);
    }
  }, [schedule, targetVehicle, isOpen]);

  if (!isOpen || !schedule) return null;

  // Real-time calculation previews for next-due formula (Requirement 12)
  const numOdometer = Number(odometer) || 0;
  const numHours = Number(operatingHours) || 0;
  const nextOdometerPreview = numOdometer + schedule.intervalKilometers;
  const nextHoursPreview = numHours + schedule.intervalHours;
  const nextDatePreview = new Date(
    new Date(serviceDate).getTime() + schedule.intervalDays * 24 * 60 * 60 * 1000
  ).toISOString().slice(0, 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numCost = parseFloat(cost);
    if (isNaN(numCost) || numCost < 0) {
      setErrorMsg('Service cost cannot be negative.');
      return;
    }

    if (numOdometer < 0) {
      setErrorMsg('Completed odometer reading cannot be negative.');
      return;
    }

    if (numHours < 0) {
      setErrorMsg('Operating hours cannot be negative.');
      return;
    }

    const partsList = replacedParts
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    try {
      db.completeMaintenanceService({
        vehicleId: schedule.vehicleId,
        scheduleId: schedule.scheduleId,
        maintenanceTypeId: schedule.maintenanceTypeId,
        serviceDate,
        odometer: numOdometer,
        operatingHours: numHours,
        cost: numCost,
        vendorName: serviceCenter.trim() || undefined,
        invoiceNumber: invoiceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        partsChanged: partsList.length > 0 ? partsList.join(', ') : undefined,
        createExpenseEntry: logAsExpense,
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete maintenance service');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl text-slate-100 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-800/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Mark Maintenance Service Completed
              </h3>
              <p className="text-xs text-slate-400">
                Logs service record, calculates next due date/KM/hours, and updates reminders
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

          {/* Schedule Info Summary */}
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-100">
                {schedule.customName || 'Scheduled Service'}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Vehicle: {targetVehicle?.vehicleName} ({targetVehicle?.vehicleNumber})
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              Intervals: +{schedule.intervalKilometers.toLocaleString()} KM | +{schedule.intervalDays}d | +{schedule.intervalHours}h
            </div>
          </div>

          {/* Service Date & Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Service Performed Date *</label>
              <input
                type="date"
                required
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Cost (₹) *</label>
              <div className="relative">
                <span className="text-emerald-400 font-bold absolute left-3 top-1/2 -translate-y-1/2 text-sm">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Completed Odometer & Completed Operating Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Completed Odometer (KM) *</label>
              <input
                type="number"
                min="0"
                required
                value={odometer}
                onChange={(e) => setOdometer(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">Will update vehicle current odometer</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Completed Operating Hours *</label>
              <input
                type="number"
                min="0"
                required
                value={operatingHours}
                onChange={(e) => setOperatingHours(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">Will update vehicle operating hours</span>
            </div>
          </div>

          {/* Service Center & Invoice # */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Service Center / Workshop</label>
              <input
                type="text"
                placeholder="e.g. Authorized Dealer Service"
                value={serviceCenter}
                onChange={(e) => setServiceCenter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Invoice / Work Order #</label>
              <input
                type="text"
                placeholder="e.g. WO-77810"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Replaced Parts */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Replaced Parts (Comma separated)</label>
            <input
              type="text"
              placeholder="Oil Filter, Synthetic Oil 5W-30, Drain Plug Gasket"
              value={replacedParts}
              onChange={(e) => setReplacedParts(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Technician Notes</label>
            <textarea
              rows={2}
              placeholder="Multi-point inspection passed, tire tread depth checked, brake pads at 80%..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Checkbox: Also log expense entry */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="chk-log-expense"
              checked={logAsExpense}
              onChange={(e) => setLogAsExpense(e.target.checked)}
              className="w-4 h-4 rounded-sm bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
            />
            <label htmlFor="chk-log-expense" className="text-xs text-slate-300 cursor-pointer">
              Automatically create corresponding financial expense record under <strong>Maintenance</strong> category
            </label>
          </div>

          {/* Next Due Auto-Calculation Preview */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5 space-y-1.5 text-xs text-emerald-300">
            <div className="font-bold flex items-center space-x-1.5 text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              <span>Next Due Automatic Projections (Requirement 12):</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-slate-400 block">Next Due Date:</span>
                <strong className="text-slate-100">{nextDatePreview}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Next Due KM:</span>
                <strong className="text-slate-100">{nextOdometerPreview.toLocaleString()} KM</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Next Due Hours:</span>
                <strong className="text-slate-100">{nextHoursPreview} Hrs</strong>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
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
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs transition active:scale-95 flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Recalculate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
