import React, { useState, useEffect } from 'react';
import { X, Car, Fuel, Calendar, Gauge, Clock, Image, FileText, AlertCircle } from 'lucide-react';
import { db } from '../services/db';
import { FuelType, Vehicle, VehicleType } from '../types';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingVehicle?: Vehicle | null;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  editingVehicle,
}) => {
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Car');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [fuelType, setFuelType] = useState<FuelType>('Petrol');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [currentOdometer, setCurrentOdometer] = useState<number>(0);
  const [currentOperatingHours, setCurrentOperatingHours] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const vehicleTypes: VehicleType[] = [
    'Car', 'Bike', 'Scooter', 'Van', 'Truck', 'Bus', 'Auto', 'Tractor', 'Other'
  ];

  const fuelTypes: FuelType[] = [
    'Petrol', 'Diesel', 'CNG', 'LPG', 'Electric', 'Hybrid', 'Other'
  ];

  useEffect(() => {
    if (editingVehicle) {
      setVehicleName(editingVehicle.vehicleName);
      setVehicleNumber(editingVehicle.vehicleNumber);
      setVehicleType(editingVehicle.vehicleType);
      setBrand(editingVehicle.brand);
      setModel(editingVehicle.model);
      setYear(editingVehicle.year);
      setFuelType(editingVehicle.fuelType);
      setPurchaseDate(editingVehicle.purchaseDate || '');
      setCurrentOdometer(editingVehicle.currentOdometer);
      setCurrentOperatingHours(editingVehicle.currentOperatingHours);
      setImageUrl(editingVehicle.imageUrl || '');
      setNotes(editingVehicle.notes || '');
      setErrorMsg(null);
    } else {
      setVehicleName('');
      setVehicleNumber('');
      setVehicleType('Car');
      setBrand('');
      setModel('');
      setYear(new Date().getFullYear());
      setFuelType('Petrol');
      setPurchaseDate(new Date().toISOString().slice(0, 10));
      setCurrentOdometer(0);
      setCurrentOperatingHours(0);
      setImageUrl('');
      setNotes('');
      setErrorMsg(null);
    }
  }, [editingVehicle, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!vehicleName.trim()) {
      setErrorMsg('Vehicle name is required.');
      return;
    }

    if (!vehicleNumber.trim()) {
      setErrorMsg('License plate / registration number is required.');
      return;
    }

    if (currentOdometer < 0) {
      setErrorMsg('Current odometer cannot be negative.');
      return;
    }

    if (currentOperatingHours < 0) {
      setErrorMsg('Operating hours cannot be negative.');
      return;
    }

    try {
      if (editingVehicle) {
        db.updateVehicle(editingVehicle.vehicleId, {
          vehicleName: vehicleName.trim(),
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          vehicleType,
          brand: brand.trim(),
          model: model.trim(),
          year: Number(year),
          fuelType,
          purchaseDate: purchaseDate || undefined,
          currentOdometer: Number(currentOdometer),
          currentOperatingHours: Number(currentOperatingHours),
          imageUrl: imageUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        db.createVehicle({
          vehicleName: vehicleName.trim(),
          vehicleNumber: vehicleNumber.trim().toUpperCase(),
          vehicleType,
          brand: brand.trim(),
          model: model.trim(),
          year: Number(year),
          fuelType,
          purchaseDate: purchaseDate || undefined,
          currentOdometer: Number(currentOdometer),
          currentOperatingHours: Number(currentOperatingHours),
          imageUrl: imageUrl.trim() || undefined,
          notes: notes.trim() || undefined,
          isActive: true,
        });
      }

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save vehicle');
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
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {editingVehicle ? 'Edit Vehicle Profile' : 'Add New Vehicle to Fleet'}
              </h3>
              <p className="text-xs text-slate-400">
                Supports Cars, Bikes, Vans, Trucks, Buses, Autos, and all fuel types
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

          {/* Vehicle Name & Plate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. City Commuter, Delivery Van #1"
                value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Registration / Number Plate *</label>
              <input
                type="text"
                required
                placeholder="e.g. ABC-1234 or DL-01-AB-1234"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 uppercase focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Type & Fuel Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Type *</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                {vehicleTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Fuel Type *</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                {fuelTypes.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Brand, Model, Year */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Brand</label>
              <input
                type="text"
                placeholder="Toyota, Honda"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Model</label>
              <input
                type="text"
                placeholder="Camry, Activa"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Model Year</label>
              <input
                type="number"
                min="1970"
                max="2035"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Telemetry: Current Odometer & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Odometer (KM)</label>
              <input
                type="number"
                min="0"
                value={currentOdometer}
                onChange={(e) => setCurrentOdometer(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Operating Hours</label>
              <input
                type="number"
                min="0"
                value={currentOperatingHours}
                onChange={(e) => setCurrentOperatingHours(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Purchase Date & Image URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Purchase Date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Photo URL (Optional)</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes & Details</label>
            <textarea
              rows={2}
              placeholder="Insurance policy numbers, VIN, tire specifications, driver assignments..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
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
              {editingVehicle ? 'Save Changes' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
