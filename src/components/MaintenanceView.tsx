import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  CheckCircle, 
  Calendar, 
  Clock, 
  Gauge, 
  Car, 
  Trash2, 
  Edit3, 
  History, 
  Check, 
  AlertTriangle,
  Layers,
  FileCheck2,
  DollarSign
} from 'lucide-react';
import { db } from '../services/db';
import { 
  MaintenanceRecord, 
  MaintenanceSchedule, 
  MaintenanceType, 
  Vehicle 
} from '../types';
import { formatCurrency } from '../utils/format';

interface MaintenanceViewProps {
  schedules: MaintenanceSchedule[];
  records: MaintenanceRecord[];
  vehicles: Vehicle[];
  maintenanceTypes: MaintenanceType[];
  selectedVehicleId: string;
  onOpenNewSchedule: () => void;
  onOpenCompleteService: (schedule: MaintenanceSchedule) => void;
  onEditSchedule: (schedule: MaintenanceSchedule) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  schedules,
  records,
  vehicles,
  maintenanceTypes,
  selectedVehicleId,
  onOpenNewSchedule,
  onOpenCompleteService,
  onEditSchedule,
}) => {
  const [activeTab, setActiveTab] = useState<'schedules' | 'history'>('schedules');
  const [filterVehicle, setFilterVehicle] = useState(selectedVehicleId || 'ALL');

  React.useEffect(() => {
    if (selectedVehicleId) {
      setFilterVehicle(selectedVehicleId);
    }
  }, [selectedVehicleId]);

  const vehMap = new Map<string, Vehicle>(vehicles.map((v) => [v.vehicleId, v]));
  const typeMap = new Map<string, MaintenanceType>(maintenanceTypes.map((t) => [t.maintenanceTypeId, t]));

  const filteredSchedules = schedules.filter((s) => {
    if (filterVehicle !== 'ALL' && s.vehicleId !== filterVehicle) return false;
    return true;
  });

  const filteredRecords = records.filter((r) => {
    if (filterVehicle !== 'ALL' && r.vehicleId !== filterVehicle) return false;
    return true;
  });

  const handleDeleteSchedule = (s: MaintenanceSchedule) => {
    const typeName = typeMap.get(s.maintenanceTypeId)?.name || s.customName || 'schedule';
    if (window.confirm(`Delete maintenance schedule "${typeName}"? Associated reminders will also be removed.`)) {
      db.deleteMaintenanceSchedule(s.scheduleId);
    }
  };

  const handleDeleteRecord = (r: MaintenanceRecord) => {
    if (window.confirm(`Delete service history record from ${r.serviceDate}?`)) {
      db.deleteMaintenanceRecord(r.recordId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-emerald-400" />
            <span>Preventive Maintenance & Service Records</span>
          </h2>
          <p className="text-xs text-slate-400">
            Automated maintenance intervals (KM, Days, Operating Hours), next-due projection, and service history
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <select
            value={filterVehicle}
            onChange={(e) => setFilterVehicle(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Vehicles ({vehicles.length})</option>
            {vehicles.map((v) => (
              <option key={v.vehicleId} value={v.vehicleId}>
                {v.vehicleName} ({v.vehicleNumber})
              </option>
            ))}
          </select>

          <button
            id="btn-add-schedule-main"
            onClick={onOpenNewSchedule}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Schedule</span>
          </button>
        </div>
      </div>

      {/* Sub tabs: Active Schedules vs Completed History */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('schedules')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
            activeTab === 'schedules'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Active Schedules ({filteredSchedules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
            activeTab === 'history'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Service Log & History ({filteredRecords.length})</span>
        </button>
      </div>

      {/* Schedules Tab Content */}
      {activeTab === 'schedules' && (
        <div>
          {filteredSchedules.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl p-6">
              <Wrench className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">No maintenance schedules yet.</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Set up recurring maintenance schedules for engine oil, brake pads, tire rotations, or coolant flush to receive automated reminder alerts.
              </p>
              <button
                onClick={onOpenNewSchedule}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Create Maintenance Schedule
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSchedules.map((s) => {
                const veh = vehMap.get(s.vehicleId);
                const mType = typeMap.get(s.maintenanceTypeId);
                const title = s.customName || mType?.name || 'Maintenance Service';

                const currentKm = veh?.currentOdometer || 0;
                const kmRemaining = s.nextDueOdometer - currentKm;
                const isKmOverdue = kmRemaining <= 0;

                const today = new Date().toISOString().slice(0, 10);
                const isDateOverdue = s.nextDueDate < today;

                const isOverdue = isKmOverdue || isDateOverdue;

                return (
                  <div
                    key={s.scheduleId}
                    className={`bg-slate-900 border rounded-xl p-4 shadow-xs transition flex flex-col justify-between ${
                      isOverdue
                        ? 'border-red-500/40 bg-red-950/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-bold text-slate-100">{title}</h3>
                            {isOverdue && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white font-bold uppercase animate-pulse">
                                Overdue
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center space-x-1.5">
                            <Car className="w-3 h-3 text-slate-500" />
                            <span>{veh?.vehicleName} ({veh?.vehicleNumber})</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => onEditSchedule(s)}
                            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-md transition"
                            title="Edit schedule"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(s)}
                            className="p-1 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-md transition"
                            title="Delete schedule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Next Due Targets */}
                      <div className="mt-3 bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 space-y-2">
                        <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                          <span className="flex items-center space-x-1.5">
                            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Next Due Date</span>
                          </span>
                          <span className={isDateOverdue ? 'text-red-400 font-bold' : 'text-slate-100'}>
                            {s.nextDueDate}
                          </span>
                        </div>

                        <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                          <span className="flex items-center space-x-1.5">
                            <Gauge className="w-3.5 h-3.5 text-blue-400" />
                            <span>Next Due Odometer</span>
                          </span>
                          <span className={isKmOverdue ? 'text-red-400 font-bold' : 'text-slate-100'}>
                            {s.nextDueOdometer.toLocaleString()} KM
                          </span>
                        </div>

                        <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                          <span className="flex items-center space-x-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Next Due Hours</span>
                          </span>
                          <span className="text-slate-100">
                            {s.nextDueHours} Hours
                          </span>
                        </div>
                      </div>

                      {/* Intervals configuration */}
                      <div className="mt-3 text-[11px] text-slate-400 grid grid-cols-3 gap-2 text-center bg-slate-900/60 p-2 rounded-lg">
                        <div>
                          <div className="text-slate-500 text-[10px]">Interval KM</div>
                          <div className="font-semibold text-slate-200">+{s.intervalKilometers.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-[10px]">Interval Days</div>
                          <div className="font-semibold text-slate-200">+{s.intervalDays}d</div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-[10px]">Interval Hrs</div>
                          <div className="font-semibold text-slate-200">+{s.intervalHours}h</div>
                        </div>
                      </div>

                      {/* Last Completed Info */}
                      <div className="mt-2 text-[10px] text-slate-500">
                        Last completed: {s.lastCompletedDate || 'Never'} at {s.lastCompletedOdometer.toLocaleString()} KM
                      </div>
                    </div>

                    {/* Action button to mark service completed */}
                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <button
                        onClick={() => onOpenCompleteService(s)}
                        className="w-full flex items-center justify-center space-x-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark Service Completed</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* History Records Tab Content */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12 px-4">
              <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">No service history records yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Completed services will appear here automatically when you mark maintenance schedules as completed.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/50 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Service Performed</th>
                    <th className="py-3 px-4">Odometer / Hours</th>
                    <th className="py-3 px-4">Cost</th>
                    <th className="py-3 px-4">Service Center & Invoice</th>
                    <th className="py-3 px-4">Notes & Parts</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredRecords.map((r) => {
                    const veh = vehMap.get(r.vehicleId);
                    const mType = typeMap.get(r.maintenanceTypeId);

                    return (
                      <tr key={r.recordId} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-medium text-slate-200 whitespace-nowrap">
                          {r.serviceDate}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-100">{veh?.vehicleName || r.vehicleId}</div>
                          <div className="text-[11px] font-mono text-emerald-400">{veh?.vehicleNumber}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-200 whitespace-nowrap">
                          {mType?.name || 'Scheduled Service'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div>{r.odometer.toLocaleString()} KM</div>
                          <div className="text-[11px] text-slate-400">{r.operatingHours} hrs</div>
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-400 whitespace-nowrap">
                          {formatCurrency(r.cost)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div>{r.serviceCenter || '-'}</div>
                          {r.invoiceNumber && (
                            <div className="text-[11px] text-slate-400">Inv #{r.invoiceNumber}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="truncate text-slate-300" title={r.notes}>{r.notes || '-'}</div>
                          {r.replacedParts && r.replacedParts.length > 0 && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Parts: {r.replacedParts.join(', ')}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteRecord(r)}
                            className="p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-md transition"
                            title="Delete service log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
