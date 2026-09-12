import React, { useState } from 'react';
import { 
  Fuel, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Edit3, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  FileText, 
  Car, 
  Tag, 
  ArrowUpDown,
  CheckCircle,
  ExternalLink,
  Receipt
} from 'lucide-react';
import { db } from '../services/db';
import { Expense, ExpenseCategory, ExpenseFilter, ExpenseSubcategory, Vehicle } from '../types';
import { formatCurrency } from '../utils/format';

interface ExpensesViewProps {
  expenses: Expense[];
  vehicles: Vehicle[];
  categories: ExpenseCategory[];
  subcategories: ExpenseSubcategory[];
  selectedVehicleId: string;
  onOpenNewExpense: () => void;
  onEditExpense: (expense: Expense) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  vehicles,
  categories,
  subcategories,
  selectedVehicleId,
  onOpenNewExpense,
  onEditExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVehicle, setFilterVehicle] = useState(selectedVehicleId || 'ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterSubcategory, setFilterSubcategory] = useState('ALL');
  const [filterPayment, setFilterPayment] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeDatePreset, setActiveDatePreset] = useState<'all' | 'today' | 'this_month' | 'last_30' | 'this_year' | 'custom'>('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sync if selectedVehicleId changes from Header
  React.useEffect(() => {
    if (selectedVehicleId) {
      setFilterVehicle(selectedVehicleId);
    }
  }, [selectedVehicleId]);

  const vehMap = new Map<string, Vehicle>(vehicles.map((v) => [v.vehicleId, v]));
  const catMap = new Map<string, ExpenseCategory>(categories.map((c) => [c.categoryId, c]));
  const subMap = new Map<string, ExpenseSubcategory>(subcategories.map((s) => [s.subcategoryId, s]));

  // Dynamic subcategories available based on selected category filter
  const filteredSubcategories = filterCategory === 'ALL'
    ? subcategories
    : subcategories.filter((s) => s.categoryId === filterCategory);

  // Filter application
  const activeExpenses = expenses.filter((e) => {
    // Vehicle filter
    if (filterVehicle !== 'ALL' && e.vehicleId !== filterVehicle) return false;

    // Category filter
    if (filterCategory !== 'ALL' && e.categoryId !== filterCategory) return false;

    // Subcategory filter
    if (filterSubcategory !== 'ALL' && e.subcategoryId !== filterSubcategory) return false;

    // Payment method filter
    if (filterPayment !== 'ALL' && e.paymentMethod !== filterPayment) return false;

    // Date range
    if (startDate && e.date < startDate) return false;
    if (endDate && e.date > endDate) return false;

    // Amount range
    if (minAmount && e.amount < Number(minAmount)) return false;
    if (maxAmount && e.amount > Number(maxAmount)) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const veh = vehMap.get(e.vehicleId);
      const vehName = veh?.vehicleName.toLowerCase() || '';
      const vehNum = veh?.vehicleNumber.toLowerCase() || '';
      const vendor = e.vendorName?.toLowerCase() || '';
      const invoice = e.invoiceNumber?.toLowerCase() || '';
      const desc = e.description?.toLowerCase() || '';
      const catName = catMap.get(e.categoryId)?.name.toLowerCase() || '';
      const subName = subMap.get(e.subcategoryId)?.name.toLowerCase() || '';

      const match =
        vehName.includes(q) ||
        vehNum.includes(q) ||
        vendor.includes(q) ||
        invoice.includes(q) ||
        desc.includes(q) ||
        catName.includes(q) ||
        subName.includes(q);

      if (!match) return false;
    }

    return true;
  });

  const totalFilteredAmount = activeExpenses.reduce((sum, e) => sum + e.amount, 0);

  const selectedVehicleObj = filterVehicle !== 'ALL' ? vehMap.get(filterVehicle) : null;
  const selectedCategoryObj = filterCategory !== 'ALL' ? catMap.get(filterCategory) : null;
  const allUserExpensesTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const percentOfTotal = allUserExpensesTotal > 0 ? (totalFilteredAmount / allUserExpensesTotal) * 100 : 0;
  const averagePerExpense = activeExpenses.length > 0 ? totalFilteredAmount / activeExpenses.length : 0;

  // Top category calculation in this filtered subset
  const categorySpendingInFilter: Record<string, number> = {};
  for (const e of activeExpenses) {
    categorySpendingInFilter[e.categoryId] = (categorySpendingInFilter[e.categoryId] || 0) + e.amount;
  }
  let topCategoryName = '';
  let topCategoryAmount = 0;
  for (const catId of Object.keys(categorySpendingInFilter)) {
    const amt = categorySpendingInFilter[catId];
    if (amt > topCategoryAmount) {
      topCategoryAmount = amt;
      topCategoryName = catMap.get(catId)?.name || catId;
    }
  }

  const handleDeleteExpense = (exp: Expense) => {
    if (window.confirm(`Delete expense of ${formatCurrency(exp.amount)} on ${exp.date}?`)) {
      db.deleteExpense(exp.expenseId);
    }
  };

  const handleExportCSV = () => {
    const csvContent = db.exportExpensesCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fleet_expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDatePreset = (preset: 'all' | 'today' | 'this_month' | 'last_30' | 'this_year') => {
    setActiveDatePreset(preset);
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'this_month') {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      setStartDate(`${year}-${month}-01`);
      setEndDate(todayStr);
    } else if (preset === 'last_30') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      setStartDate(past30.toISOString().slice(0, 10));
      setEndDate(todayStr);
    } else if (preset === 'this_year') {
      setStartDate(`${now.getFullYear()}-01-01`);
      setEndDate(todayStr);
    }
  };

  const getDateRangeLabel = () => {
    if (!startDate && !endDate) return 'All-Time';
    if (startDate && !endDate) return `From ${startDate}`;
    if (!startDate && endDate) return `Until ${endDate}`;
    if (startDate === endDate) return startDate;
    return `${startDate} to ${endDate}`;
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterVehicle('ALL');
    setFilterCategory('ALL');
    setFilterSubcategory('ALL');
    setFilterPayment('ALL');
    setStartDate('');
    setEndDate('');
    setActiveDatePreset('all');
    setMinAmount('');
    setMaxAmount('');
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Fuel className="w-5 h-5 text-emerald-400" />
            <span>Expense Records & Fuel Tracking</span>
          </h2>
          <p className="text-xs text-slate-400">
            Log and filter vehicle expenditures, fuel purchases, repair receipts, and toll fees
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
            title="Download full expense history as CSV"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            id="btn-log-expense-main"
            onClick={onOpenNewExpense}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* High-Visibility Filter Spending Summary Bar */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-lg shadow-emerald-950/20">
        {/* Subtle accent top border glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Main Metric Section */}
          <div className="flex items-start sm:items-center space-x-4">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-inner shrink-0">
              <DollarSign className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Filtered Expenses
                </span>
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Summary</span>
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight mt-1 flex items-baseline space-x-1.5">
                <span>{formatCurrency(totalFilteredAmount)}</span>
              </div>
              <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-1.5">
                <span>Showing</span>
                <strong className="text-slate-100">{activeExpenses.length} {activeExpenses.length === 1 ? 'expense' : 'expenses'}</strong>
                <span>for</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-medium border border-slate-700">
                  {filterVehicle === 'ALL' ? `All Vehicles (${vehicles.length})` : (selectedVehicleObj?.vehicleName || 'Vehicle')}
                </span>
                <span>• Period:</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-medium border border-slate-700">
                  {getDateRangeLabel()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stat Pill Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 lg:w-auto shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-6">
            {/* Scope Pill */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Car className="w-3.5 h-3.5" />
                <span>Vehicle Scope</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-100 truncate max-w-[130px]" title={selectedVehicleObj ? `${selectedVehicleObj.vehicleName} (${selectedVehicleObj.vehicleNumber})` : 'All Vehicles'}>
                {selectedVehicleObj ? selectedVehicleObj.vehicleName : 'All Vehicles'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {selectedVehicleObj ? selectedVehicleObj.vehicleNumber : `Full fleet (${vehicles.length})`}
              </div>
            </div>

            {/* Average Spend Pill */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 text-purple-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Average Spend</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-100">
                {formatCurrency(averagePerExpense)}
              </div>
              <div className="text-[10px] text-slate-400">
                per transaction
              </div>
            </div>

            {/* Top Category Pill */}
            <div className="col-span-2 sm:col-span-1 bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
              <div className="flex items-center space-x-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Top Category</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-amber-300 truncate max-w-[130px]" title={topCategoryName || 'None'}>
                {topCategoryName || 'None'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {topCategoryAmount > 0 ? `${formatCurrency(topCategoryAmount)} spent` : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Summary Tags / Reset Action */}
        {(filterVehicle !== 'ALL' || filterCategory !== 'ALL' || filterSubcategory !== 'ALL' || filterPayment !== 'ALL' || startDate || endDate || searchQuery) && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium text-[11px]">Active Filters:</span>
              {filterVehicle !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-full text-[11px]">
                  <span>Vehicle: {selectedVehicleObj?.vehicleName}</span>
                  <button onClick={() => setFilterVehicle('ALL')} className="hover:text-white cursor-pointer ml-0.5">×</button>
                </span>
              )}
              {(startDate || endDate) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-full text-[11px]">
                  <span>Date: {getDateRangeLabel()}</span>
                  <button onClick={() => { setStartDate(''); setEndDate(''); setActiveDatePreset('all'); }} className="hover:text-white cursor-pointer ml-0.5">×</button>
                </span>
              )}
              {filterCategory !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-full text-[11px]">
                  <span>Category: {selectedCategoryObj?.name}</span>
                  <button onClick={() => { setFilterCategory('ALL'); setFilterSubcategory('ALL'); }} className="hover:text-white cursor-pointer ml-0.5">×</button>
                </span>
              )}
              {filterSubcategory !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-[11px]">
                  <span>Sub: {subMap.get(filterSubcategory)?.name}</span>
                  <button onClick={() => setFilterSubcategory('ALL')} className="hover:text-white cursor-pointer ml-0.5">×</button>
                </span>
              )}
              {filterPayment !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-[11px]">
                  <span>Pay: {filterPayment}</span>
                  <button onClick={() => setFilterPayment('ALL')} className="hover:text-white cursor-pointer ml-0.5">×</button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-[11px]">
                  <span>"{searchQuery}"</span>
                  <button onClick={() => setSearchQuery('')} className="hover:text-white cursor-pointer ml-0.5">×</button>
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Primary Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3.5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Live Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vendor, invoice, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Vehicle Filter */}
          <div>
            <select
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Vehicles ({vehicles.length})</option>
              {vehicles.map((v) => (
                <option key={v.vehicleId} value={v.vehicleId}>
                  {v.vehicleName} ({v.vehicleNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setFilterSubcategory('ALL');
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Filter */}
          <div>
            <select
              value={filterSubcategory}
              onChange={(e) => setFilterSubcategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Subcategories</option>
              {filteredSubcategories.map((s) => (
                <option key={s.subcategoryId} value={s.subcategoryId}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Prominent Quick Date Presets & Date Pickers */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Date Range:</span>
            </span>
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_30', label: 'Last 30 Days' },
              { id: 'this_year', label: 'This Year' },
            ].map((p) => {
              const isSelected = activeDatePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleDatePreset(p.id as any)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <div className="flex items-center space-x-1">
              <span className="text-slate-500 text-[11px]">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setActiveDatePreset('custom');
                }}
                className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-slate-500 text-[11px]">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setActiveDatePreset('custom');
                }}
                className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Toggle Advanced Filters (Payment Method, Min/Max Amount) */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>{showAdvancedFilters ? 'Hide Advanced Filters' : 'More Filters (Payment Method, Amount Range)'}</span>
          </button>

          {(searchQuery || filterVehicle !== 'ALL' || filterCategory !== 'ALL' || filterSubcategory !== 'ALL' || filterPayment !== 'ALL' || startDate || endDate || minAmount || maxAmount) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Start Date (From)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">End Date (To)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Payment Method</label>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Fuel Card">Fuel Card</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="block text-[10px] text-slate-400 mb-1">Min (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] text-slate-400 mb-1">Max (₹)</label>
                <input
                  type="number"
                  placeholder="10000"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary Bar */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
        <div>
          Showing <span className="font-bold text-slate-200">{activeExpenses.length}</span> record{activeExpenses.length === 1 ? '' : 's'}
        </div>
        <div>
          Filtered Total: <span className="font-bold text-emerald-400 text-sm">{formatCurrency(totalFilteredAmount)}</span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        {activeExpenses.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Fuel className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300">
              {expenses.length === 0 ? 'No expenses recorded yet.' : 'No expense records match your filter'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {expenses.length === 0 
                ? 'Add your first vehicle expense to track fuel refills, parts, and service costs.' 
                : 'No transactions match your current filter criteria. Try clearing or adjusting your filters.'}
            </p>
            <button
              onClick={expenses.length === 0 ? onOpenNewExpense : handleResetFilters}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              {expenses.length === 0 ? 'Log First Expense' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/50 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Category / Subcategory</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Odometer / Hours</th>
                  <th className="py-3 px-4">Payment & Vendor</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {activeExpenses.map((exp) => {
                  const veh = vehMap.get(exp.vehicleId);
                  const cat = catMap.get(exp.categoryId);
                  const sub = subMap.get(exp.subcategoryId);

                  return (
                    <tr key={exp.expenseId} className="hover:bg-slate-800/40 transition">
                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-200">
                        {exp.date}
                      </td>

                      {/* Vehicle */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-100">
                          {veh?.vehicleName || 'Unknown Vehicle'}
                        </div>
                        <div className="text-[11px] font-mono text-emerald-400">
                          {veh?.vehicleNumber || exp.vehicleId}
                        </div>
                      </td>

                      {/* Category & Subcategory */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center space-x-1 font-medium text-slate-200">
                          <span>{cat?.name || exp.categoryId}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {sub?.name || exp.subcategoryId}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-emerald-400">
                          {formatCurrency(exp.amount)}
                        </span>
                      </td>

                      {/* Odometer & Hours */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div>{exp.odometer.toLocaleString()} KM</div>
                        <div className="text-[11px] text-slate-400">{exp.operatingHours} hrs</div>
                      </td>

                      {/* Payment & Vendor */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                          {exp.paymentMethod}
                        </span>
                        {exp.vendorName && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {exp.vendorName}
                            {exp.invoiceNumber && ` (Inv #${exp.invoiceNumber})`}
                          </div>
                        )}
                      </td>

                      {/* Description & Receipt */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="truncate text-slate-300" title={exp.description}>
                          {exp.description || '-'}
                        </div>
                        {exp.receiptUrl && (
                          <a
                            href={exp.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-[11px] text-emerald-400 hover:text-emerald-300 mt-0.5"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>Receipt</span>
                          </a>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => onEditExpense(exp)}
                            className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-md transition"
                            title="Edit expense"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(exp)}
                            className="p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-md transition"
                            title="Delete expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
