import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Fuel, CreditCard, Tag, Car, AlertCircle, FileText, Check } from 'lucide-react';
import { db } from '../services/db';
import { Expense, ExpenseCategory, ExpenseSubcategory, PaymentMethod, Vehicle } from '../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingExpense?: Expense | null;
  vehicles: Vehicle[];
  categories: ExpenseCategory[];
  subcategories: ExpenseSubcategory[];
  defaultVehicleId?: string;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  editingExpense,
  vehicles,
  categories,
  subcategories,
  defaultVehicleId,
}) => {
  const [vehicleId, setVehicleId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [odometer, setOdometer] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [vendorName, setVendorName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize or reset form on open or editing change
  useEffect(() => {
    if (editingExpense) {
      setVehicleId(editingExpense.vehicleId);
      setCategoryId(editingExpense.categoryId);
      setSubcategoryId(editingExpense.subcategoryId);
      setAmount(editingExpense.amount.toString());
      setDate(editingExpense.date);
      setOdometer(editingExpense.odometer.toString());
      setOperatingHours(editingExpense.operatingHours.toString());
      setPaymentMethod(editingExpense.paymentMethod);
      setVendorName(editingExpense.vendorName || '');
      setInvoiceNumber(editingExpense.invoiceNumber || '');
      setReceiptUrl(editingExpense.receiptUrl || '');
      setDescription(editingExpense.description || '');
      setErrorMsg(null);
    } else {
      const initialVeh = defaultVehicleId && defaultVehicleId !== 'ALL'
        ? defaultVehicleId
        : (vehicles[0]?.vehicleId || '');
      setVehicleId(initialVeh);

      const targetVeh = vehicles.find((v) => v.vehicleId === initialVeh);
      setOdometer(targetVeh ? targetVeh.currentOdometer.toString() : '0');
      setOperatingHours(targetVeh ? targetVeh.currentOperatingHours.toString() : '0');

      const initialCat = categories[0]?.categoryId || '';
      setCategoryId(initialCat);

      const initialSub = subcategories.find((s) => s.categoryId === initialCat)?.subcategoryId || '';
      setSubcategoryId(initialSub);

      setAmount('');
      setDate(new Date().toISOString().slice(0, 10));
      setPaymentMethod('Credit Card');
      setVendorName('');
      setInvoiceNumber('');
      setReceiptUrl('');
      setDescription('');
      setErrorMsg(null);
    }
  }, [editingExpense, isOpen, defaultVehicleId, vehicles, categories, subcategories]);

  // When vehicle changes in modal, auto-fill current odometer & hours as suggestions
  const handleVehicleChange = (newVehId: string) => {
    setVehicleId(newVehId);
    if (!editingExpense) {
      const v = vehicles.find((veh) => veh.vehicleId === newVehId);
      if (v) {
        setOdometer(v.currentOdometer.toString());
        setOperatingHours(v.currentOperatingHours.toString());
      }
    }
  };

  // When category changes, auto-select the first available subcategory
  const handleCategoryChange = (newCatId: string) => {
    setCategoryId(newCatId);
    const available = subcategories.filter((s) => s.categoryId === newCatId);
    if (available.length > 0) {
      setSubcategoryId(available[0].subcategoryId);
    } else {
      setSubcategoryId('');
    }
  };

  const availableSubcategories = subcategories.filter((s) => s.categoryId === categoryId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation rules (Requirement 10)
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Expense amount must be greater than 0.');
      return;
    }

    if (!vehicleId) {
      setErrorMsg('Please select a vehicle.');
      return;
    }

    if (!categoryId) {
      setErrorMsg('Please select an expense category.');
      return;
    }

    if (!subcategoryId) {
      setErrorMsg('Please select an expense subcategory.');
      return;
    }

    const numOdometer = parseFloat(odometer || '0');
    if (isNaN(numOdometer) || numOdometer < 0) {
      setErrorMsg('Odometer reading cannot be negative.');
      return;
    }

    const numHours = parseFloat(operatingHours || '0');
    if (isNaN(numHours) || numHours < 0) {
      setErrorMsg('Operating hours cannot be negative.');
      return;
    }

    try {
      if (editingExpense) {
        db.updateExpense(editingExpense.expenseId, {
          vehicleId,
          categoryId,
          subcategoryId,
          amount: numAmount,
          date,
          odometer: numOdometer,
          operatingHours: numHours,
          paymentMethod,
          vendorName: vendorName.trim() || undefined,
          invoiceNumber: invoiceNumber.trim() || undefined,
          receiptUrl: receiptUrl.trim() || undefined,
          description: description.trim() || undefined,
        });
      } else {
        db.createExpense({
          vehicleId,
          categoryId,
          subcategoryId,
          amount: numAmount,
          date,
          odometer: numOdometer,
          operatingHours: numHours,
          paymentMethod,
          isRecurring: false,
          vendorName: vendorName.trim() || undefined,
          invoiceNumber: invoiceNumber.trim() || undefined,
          receiptUrl: receiptUrl.trim() || undefined,
          description: description.trim() || undefined,
        });
      }

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save expense');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl text-slate-100 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-800/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {editingExpense ? 'Edit Vehicle Expense' : 'Log New Vehicle Expense'}
              </h3>
              <p className="text-xs text-slate-400">
                Validated according to database constraints (amount &gt; 0, non-negative odometer)
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Vehicle Selection & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle *</label>
              <select
                required
                value={vehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subcategory *</label>
              <select
                required
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                {availableSubcategories.map((s) => (
                  <option key={s.subcategoryId} value={s.subcategoryId}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (₹) *</label>
              <div className="relative">
                <span className="text-emerald-400 font-bold absolute left-3 top-1/2 -translate-y-1/2 text-sm">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500">Constraint: amount &gt; 0</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Odometer & Operating Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Odometer (KM)</label>
              <input
                type="number"
                min="0"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">Updates vehicle odometer if higher</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Operating Hours</label>
              <input
                type="number"
                min="0"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500">Updates vehicle hours if higher</span>
            </div>
          </div>

          {/* Vendor Name & Invoice Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Vendor / Fuel Station</label>
              <input
                type="text"
                placeholder="e.g. Shell Express, Firestone Auto"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Invoice / Receipt #</label>
              <input
                type="text"
                placeholder="e.g. INV-99201"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Receipt URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Receipt URL / Document Link (Optional)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/... or cloud storage URL"
              value={receiptUrl}
              onChange={(e) => setReceiptUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Notes / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Notes</label>
            <textarea
              rows={2}
              placeholder="Additional notes about fuel quality, route, repairs performed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
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
              className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs transition"
            >
              {editingExpense ? 'Save Changes' : 'Log Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
