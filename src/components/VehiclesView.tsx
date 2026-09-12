import React, { useState } from 'react';
import { 
  Car, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Gauge, 
  Clock, 
  Fuel, 
  Calendar, 
  FileText, 
  AlertCircle, 
  Check, 
  X,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { db } from '../services/db';
import { FuelType, Vehicle, VehicleType } from '../types';

interface VehiclesViewProps {
  vehicles: Vehicle[];
  onOpenNewVehicle: () => void;
  onEditVehicle: (vehicle: Vehicle) => void;
  onSelectVehicle: (vehicleId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({
  vehicles,
  onOpenNewVehicle,
  onEditVehicle,
  onSelectVehicle,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [odometerModalVehicle, setOdometerModalVehicle] = useState<Vehicle | null>(null);
  const [newOdometerVal, setNewOdometerVal] = useState<number>(0);
  const [newHoursVal, setNewHoursVal] = useState<number>(0);

  const vehicleTypes: VehicleType[] = [
    'Car', 'Bike', 'Scooter', 'Van', 'Truck', 'Bus', 'Auto', 'Tractor', 'Other'
  ];

  const filteredVehicles = vehicles.filter((v) => {
    const matchSearch =
      v.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = selectedType === 'ALL' || v.vehicleType === selectedType;
    return matchSearch && matchType;
  });

  const handleDelete = (vehicle: Vehicle) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${vehicle.vehicleName}" (${vehicle.vehicleNumber})? This will permanently delete all associated expenses, maintenance schedules, and reminders.`
      )
    ) {
      db.deleteVehicle(vehicle.vehicleId);
    }
  };

  const handleOpenOdometerUpdate = (veh: Vehicle) => {
    setOdometerModalVehicle(veh);
    setNewOdometerVal(veh.currentOdometer);
    setNewHoursVal(veh.currentOperatingHours);
  };

  const handleSaveOdometerUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!odometerModalVehicle) return;

    db.updateVehicle(odometerModalVehicle.vehicleId, {
      currentOdometer: Number(newOdometerVal),
      currentOperatingHours: Number(newHoursVal),
    });
    setOdometerModalVehicle(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Car className="w-5 h-5 text-emerald-400" />
            <span>Vehicles & Fleet Management</span>
          </h2>
          <p className="text-xs text-slate-400">
            Registered vehicles, current odometer readings, and active operating hours
          </p>
        </div>

        <button
          id="btn-add-vehicle-top"
          onClick={onOpenNewVehicle}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="search-vehicles-input"
            placeholder="Search by vehicle name, license plate, brand, or model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              selectedType === 'ALL'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Types
          </button>
          {vehicleTypes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedType === t
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicles Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">
            {vehicles.length === 0 ? 'No vehicles added yet.' : 'No vehicles found'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {vehicles.length === 0
              ? 'Add your first vehicle to start tracking expenses, fuel mileage, and maintenance schedules.'
              : searchQuery || selectedType !== 'ALL'
              ? 'Try modifying your search query or filter to see more vehicles.'
              : 'Add your first vehicle to start tracking expenses, fuel mileage, and maintenance schedules.'}
          </p>
          <button
            onClick={onOpenNewVehicle}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
          >
            Add Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVehicles.map((veh) => (
            <div
              key={veh.vehicleId}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden shadow-xs transition flex flex-col justify-between"
            >
              {/* Image or Vehicle Header Banner */}
              <div className="relative h-44 bg-slate-800 overflow-hidden group">
                {veh.imageUrl && veh.imageUrl.trim() !== '' ? (
                  <img
                    src={veh.imageUrl}
                    alt={veh.vehicleName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-600">
                    <Car className="w-16 h-16" />
                  </div>
                )}
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-xs text-emerald-400 border border-slate-700">
                    {veh.vehicleType}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-xs text-amber-400 border border-slate-700">
                    {veh.fuelType}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5 flex items-center space-x-1">
                  <button
                    onClick={() => onEditVehicle(veh)}
                    className="p-1.5 bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white rounded-lg backdrop-blur-xs border border-slate-700 transition"
                    title="Edit vehicle details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(veh)}
                    className="p-1.5 bg-slate-900/80 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg backdrop-blur-xs border border-slate-700 transition"
                    title="Delete vehicle"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Vehicle Body Info */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-100">{veh.vehicleName}</h3>
                      <p className="text-xs text-slate-400">
                        {veh.brand} {veh.model} ({veh.year})
                      </p>
                    </div>
                    <div className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-emerald-400">
                      {veh.vehicleNumber}
                    </div>
                  </div>

                  {veh.notes && (
                    <p className="text-xs text-slate-400 mt-2 bg-slate-800/40 p-2 rounded-lg line-clamp-2">
                      {veh.notes}
                    </p>
                  )}

                  {/* Telemetry Stats: Odometer & Operating Hours */}
                  <div className="grid grid-cols-2 gap-2 mt-3 bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/60">
                    <div>
                      <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <Gauge className="w-3 h-3 text-emerald-400" />
                        <span>Odometer</span>
                      </div>
                      <div className="text-sm font-bold text-slate-100">
                        {veh.currentOdometer.toLocaleString()} KM
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-blue-400" />
                        <span>Operating Hours</span>
                      </div>
                      <div className="text-sm font-bold text-slate-100">
                        {veh.currentOperatingHours.toLocaleString()} Hrs
                      </div>
                    </div>
                  </div>

                  {/* Purchase Date */}
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center space-x-1.5">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>Purchased: {veh.purchaseDate || 'N/A'}</span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenOdometerUpdate(veh)}
                    className="flex items-center space-x-1 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                    title="Update current odometer or hours reading"
                  >
                    <RefreshCw className="w-3 h-3 text-emerald-400" />
                    <span>Update KM/Hrs</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectVehicle(veh.vehicleId);
                      onNavigateTab('expenses');
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
                  >
                    <span>Expenses</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal to quickly update vehicle Odometer & Operating Hours */}
      {odometerModalVehicle && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-slate-100 mb-1">
              Update Telemetry: {odometerModalVehicle.vehicleName}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Updating the current odometer or hours will immediately recalculate maintenance reminder thresholds and schedule statuses.
            </p>

            <form onSubmit={handleSaveOdometerUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Odometer (KM)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newOdometerVal}
                  onChange={(e) => setNewOdometerVal(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">Must not be negative</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Current Operating Hours</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newHoursVal}
                  onChange={(e) => setNewHoursVal(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">Must not be negative</span>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setOdometerModalVehicle(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                >
                  Save Readings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
