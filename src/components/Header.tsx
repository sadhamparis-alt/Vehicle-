import React, { useState } from 'react';
import { 
  Car, 
  UserCheck, 
  Bell, 
  AlertTriangle, 
  Clock, 
  Shield, 
  ChevronDown, 
  Plus, 
  Check, 
  Fuel, 
  Wrench, 
  BarChart3, 
  Layers, 
  Database,
  Calendar,
  User as UserIcon
} from 'lucide-react';
import { db } from '../services/db';
import { User, Vehicle } from '../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User;
  users: User[];
  vehicles: Vehicle[];
  selectedVehicleId: string;
  setSelectedVehicleId: (id: string) => void;
  overdueCount: number;
  dueSoonCount: number;
  onOpenNewExpense: () => void;
  onOpenNewVehicle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  users,
  vehicles,
  selectedVehicleId,
  setSelectedVehicleId,
  overdueCount,
  dueSoonCount,
  onOpenNewExpense,
  onOpenNewVehicle,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');

  const handleSwitchUser = (userId: string) => {
    db.setCurrentUserId(userId);
    setShowUserDropdown(false);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const existingUsers = db.getUsers();
    const newUser: User = {
      userId: `user_${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      phone: newUserPhone.trim() || '+1 (555) 000-0000',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    existingUsers.push(newUser);
    localStorage.setItem('vms_users_v1', JSON.stringify(existingUsers));
    db.setCurrentUserId(newUser.userId);
    setShowNewUserModal(false);
    setShowUserDropdown(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
  };

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'vehicles', label: 'Vehicles', icon: Car, count: vehicles.length },
    { id: 'expenses', label: 'Expenses', icon: Fuel },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { 
      id: 'reminders', 
      label: 'Reminders', 
      icon: Bell, 
      badge: overdueCount > 0 ? overdueCount : dueSoonCount > 0 ? dueSoonCount : undefined,
      badgeColor: overdueCount > 0 ? 'bg-red-500 text-white' : 'bg-amber-500 text-white' 
    },
    { id: 'reports', label: 'Reports', icon: Calendar },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'architecture', label: 'Security & Rules', icon: Shield },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      {/* Top tier: Brand, User Switcher, Quick Alerts & Action Buttons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight text-lg text-slate-100">FleetTrack</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                  Firebase VMS
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Vehicle Expense & Maintenance Management</p>
            </div>
          </div>

          {/* Center: Vehicle Filter Selector */}
          <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-sm">
            <Car className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">Vehicle:</span>
            <select
              id="header-vehicle-filter"
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              aria-label="Filter by Vehicle"
              className="bg-transparent text-slate-200 text-xs sm:text-sm font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL" className="bg-slate-800 text-white">All Vehicles ({vehicles.length})</option>
              {vehicles.map((v) => (
                <option key={v.vehicleId} value={v.vehicleId} className="bg-slate-800 text-white">
                  {v.vehicleName} ({v.vehicleNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Right side: Alerts, Action Buttons, Multi-Tenant User Switcher */}
          <div className="flex items-center space-x-3">
            {/* Quick Alert Chips */}
            {overdueCount > 0 && (
              <button
                id="btn-alert-overdue"
                onClick={() => setCurrentTab('reminders')}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-semibold hover:bg-red-500/30 transition animate-pulse"
                title={`${overdueCount} maintenance reminders overdue`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>{overdueCount} Overdue</span>
              </button>
            )}

            {dueSoonCount > 0 && (
              <button
                id="btn-alert-duesoon"
                onClick={() => setCurrentTab('reminders')}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold hover:bg-amber-500/30 transition"
                title={`${dueSoonCount} reminders due soon`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{dueSoonCount} Due Soon</span>
              </button>
            )}

            {/* Quick Log Expense Button */}
            <button
              id="btn-quick-log-expense"
              onClick={onOpenNewExpense}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Log Expense</span>
            </button>

            {/* User Profile & Multi-Tenant Switcher */}
            <div className="relative">
              <button
                id="btn-user-switcher"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700/80 px-2.5 py-1.5 rounded-lg border border-slate-700 transition"
              >
                {currentUser.profileImage && currentUser.profileImage.trim() !== '' ? (
                  <img
                    src={currentUser.profileImage}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-slate-600"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-700/60 text-emerald-300 flex items-center justify-center text-xs font-bold border border-emerald-500/40">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                )}
                <div className="text-left hidden md:block">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400">UID: {currentUser.userId.substring(0, 8)}...</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Multi-Tenant Switcher Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-slate-200">
                  <div className="px-3 py-2 border-b border-slate-700/80">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Multi-User Isolation</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Switch accounts to verify complete data isolation between users.
                    </p>
                  </div>

                  <div className="py-1">
                    {users.map((u) => {
                      const isSelected = u.userId === currentUser.userId;
                      return (
                        <button
                          key={u.userId}
                          onClick={() => handleSwitchUser(u.userId)}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-700/60 transition ${
                            isSelected ? 'bg-slate-700/40 text-emerald-400' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            {u.profileImage && u.profileImage.trim() !== '' ? (
                              <img src={u.profileImage} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-700 text-emerald-400 flex items-center justify-center text-xs font-bold border border-slate-600">
                                {u.name ? u.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                              </div>
                            )}
                            <div>
                              <div className="text-xs font-medium text-slate-200">{u.name}</div>
                              <div className="text-[10px] text-slate-400">{u.email}</div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 px-3 border-t border-slate-700/80">
                    <button
                      onClick={() => setShowNewUserModal(true)}
                      className="w-full flex items-center justify-center space-x-1.5 py-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium hover:bg-emerald-500/10 rounded-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New User Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom tier: Clean Navigation Tabs */}
      <div className="border-t border-slate-800 bg-slate-900/90 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 py-1">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-nav-${tab.id}`}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
                      {tab.count}
                    </span>
                  )}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${tab.badgeColor}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Modal to add a new isolated user */}
      {showNewUserModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl text-slate-100">
            <h3 className="text-lg font-bold text-slate-100 mb-1">Create Isolated User Account</h3>
            <p className="text-xs text-slate-400 mb-4">
              Firestore Security Rules will isolate this user's vehicles, expenses, schedules, and reminders.
            </p>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="jordan@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 789-0123"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowNewUserModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
