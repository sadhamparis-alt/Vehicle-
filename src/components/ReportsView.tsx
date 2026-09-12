import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  Calendar, 
  DollarSign, 
  Download, 
  Car, 
  Fuel, 
  Wrench, 
  Layers, 
  TrendingUp,
  Percent,
  Clock
} from 'lucide-react';
import { db } from '../services/db';
import { Vehicle, VehicleExpenseSummary } from '../types';
import { formatCurrency, formatKm, formatHours } from '../utils/format';

interface ReportsViewProps {
  vehicles: Vehicle[];
  vehicleSummaries: VehicleExpenseSummary[];
  selectedVehicleId: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  vehicles,
  vehicleSummaries,
  selectedVehicleId,
}) => {
  const [filterVehicle, setFilterVehicle] = useState(selectedVehicleId || 'ALL');
  const [activeReportTab, setActiveReportTab] = useState<'categories' | 'subcategories' | 'fleet' | 'periodic' | 'maintenance'>('categories');

  React.useEffect(() => {
    if (selectedVehicleId) {
      setFilterVehicle(selectedVehicleId);
    }
  }, [selectedVehicleId]);

  // Fetch reporting data from db
  const reportData = db.getReportingData(filterVehicle !== 'ALL' ? filterVehicle : undefined);

  const totalExpenseAmount = reportData.expenseByCategory.reduce((sum, c) => sum + c.amount, 0);

  const handleExportCSV = () => {
    const csvContent = db.exportExpensesCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fleet_financial_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <span>Financial & Maintenance Analytics</span>
          </h2>
          <p className="text-xs text-slate-400">
            Category distributions, subcategory drilldowns, fleet comparison, periodic trends, and service cost averages
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
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Recorded Spend</div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">
            {formatCurrency(totalExpenseAmount)}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Filtered vehicle scope: {filterVehicle === 'ALL' ? 'Entire Fleet' : vehicles.find(v => v.vehicleId === filterVehicle)?.vehicleName}
          </div>
        </div>

        {/* Sub-report selector tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setActiveReportTab('categories')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeReportTab === 'categories'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Category Breakdown
          </button>
          <button
            onClick={() => setActiveReportTab('subcategories')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeReportTab === 'subcategories'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Subcategories
          </button>
          <button
            onClick={() => setActiveReportTab('fleet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeReportTab === 'fleet'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vehicle Comparison
          </button>
          <button
            onClick={() => setActiveReportTab('periodic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeReportTab === 'periodic'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Periodic (Wk / Mo / Yr)
          </button>
          <button
            onClick={() => setActiveReportTab('maintenance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeReportTab === 'maintenance'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Maintenance Costs & Avg
          </button>
        </div>
      </div>

      {/* 1. Category Breakdown Report */}
      {activeReportTab === 'categories' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>1. Expense by Category</span>
            </h3>
            <p className="text-xs text-slate-400">
              Distribution of expenditures across primary budget categories with percentage weighting
            </p>
          </div>

          {reportData.expenseByCategory.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">No expense records found.</div>
          ) : (
            <div className="space-y-3">
              {reportData.expenseByCategory.map((item) => {
                const pct = totalExpenseAmount > 0 ? (item.amount / totalExpenseAmount) * 100 : 0;

                return (
                  <div key={item.categoryId} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="font-semibold text-slate-200 flex items-center space-x-2">
                        <span>{item.name}</span>
                        <span className="text-[10px] text-slate-400">({item.count} entries)</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-slate-100">{formatCurrency(item.amount)}</span>
                        <span className="font-mono text-emerald-400 font-semibold w-12 text-right">{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. Subcategory Drilldown Report */}
      {activeReportTab === 'subcategories' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>2. Expense by Subcategory</span>
            </h3>
            <p className="text-xs text-slate-400">
              Granular spending analysis per subcategory with parent category attribution
            </p>
          </div>

          {reportData.expenseBySubcategory.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">No expense records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/50 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Subcategory</th>
                    <th className="py-2.5 px-3">Parent Category</th>
                    <th className="py-2.5 px-3">Transactions</th>
                    <th className="py-2.5 px-3">Total Spent</th>
                    <th className="py-2.5 px-3 text-right">Share of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {reportData.expenseBySubcategory.map((sub) => {
                    const pct = totalExpenseAmount > 0 ? (sub.amount / totalExpenseAmount) * 100 : 0;
                    return (
                      <tr key={sub.subcategoryId} className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3 font-semibold text-slate-200">{sub.name}</td>
                        <td className="py-2.5 px-3 text-slate-400">{sub.categoryName}</td>
                        <td className="py-2.5 px-3">{sub.count}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-400">{formatCurrency(sub.amount)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-200">{pct.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. Vehicle Comparison Report */}
      {activeReportTab === 'fleet' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Car className="w-4 h-4 text-emerald-400" />
              <span>3. Vehicle Expense Comparison</span>
            </h3>
            <p className="text-xs text-slate-400">
              Comparative cost analysis across fleet: fuel spend, preventive maintenance, repair costs, and total expenditure
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/50 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Vehicle</th>
                  <th className="py-3 px-3">Type & Fuel</th>
                  <th className="py-3 px-3">Odometer / Hours</th>
                  <th className="py-3 px-3">Fuel Spend</th>
                  <th className="py-3 px-3">Maintenance</th>
                  <th className="py-3 px-3">Repairs</th>
                  <th className="py-3 px-3 text-right">Total Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {vehicleSummaries.map((v) => (
                  <tr key={v.vehicleId} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-100">{v.vehicleName}</div>
                      <div className="font-mono text-[11px] text-emerald-400">{v.vehicleNumber}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-200">{v.vehicleType}</div>
                      <div className="text-[11px] text-slate-400">{v.fuelType}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div>{formatKm(v.currentKm)}</div>
                      <div className="text-[11px] text-slate-400">{formatHours(v.currentHours)}</div>
                    </td>
                    <td className="py-3 px-3 font-medium text-amber-400">{formatCurrency(v.fuelExpense)}</td>
                    <td className="py-3 px-3 font-medium text-blue-400">{formatCurrency(v.maintenanceExpense)}</td>
                    <td className="py-3 px-3 font-medium text-red-400">{formatCurrency(v.repairExpense)}</td>
                    <td className="py-3 px-3 text-right font-bold text-sm text-emerald-400">
                      {formatCurrency(v.totalExpense)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Periodic Reports (Weekly, Monthly, Yearly) */}
      {activeReportTab === 'periodic' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Report */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>4. Weekly Report</span>
              </h4>
              <p className="text-xs text-slate-400">Trailing 8 weeks summary</p>
            </div>

            <div className="space-y-2">
              {reportData.weeklyReport.map((w) => (
                <div key={w.label} className="bg-slate-800/60 p-2.5 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{w.label}</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(w.total)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Report */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>5. Monthly Report</span>
              </h4>
              <p className="text-xs text-slate-400">Trailing 12 months breakdown</p>
            </div>

            <div className="space-y-2">
              {reportData.monthlyReport.map((m) => (
                <div key={m.month} className="bg-slate-800/60 p-2.5 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{m.month}</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(m.total)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Yearly Report */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span>6. Yearly Report</span>
              </h4>
              <p className="text-xs text-slate-400">Year-over-year fleet expenditures</p>
            </div>

            <div className="space-y-2">
              {reportData.yearlyReport.map((y) => (
                <div key={y.year} className="bg-slate-800/60 p-2.5 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Year {y.year}</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(y.total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Maintenance Cost Report (Requirement 14.7) */}
      {activeReportTab === 'maintenance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-emerald-400" />
              <span>7. Maintenance Cost Report</span>
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated maintenance service records: Number of Services, Total Cost, and Average Cost per service type
            </p>
          </div>

          {reportData.maintenanceCostReport.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              No completed maintenance service records logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/50 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Maintenance Service Type</th>
                    <th className="py-3 px-4">Number of Services</th>
                    <th className="py-3 px-4">Total Cost</th>
                    <th className="py-3 px-4 text-right">Average Cost per Service</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {reportData.maintenanceCostReport.map((m) => (
                    <tr key={m.maintenanceTypeId} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-semibold text-slate-100">{m.name}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                          {m.serviceCount} service{m.serviceCount > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400 text-sm">
                        {formatCurrency(m.totalCost)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-200">
                        {formatCurrency(m.averageCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
