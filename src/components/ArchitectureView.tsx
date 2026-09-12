import React, { useState } from 'react';
import { 
  Shield, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Lock, 
  CheckCircle, 
  Copy, 
  Check, 
  Layers, 
  Key,
  Server,
  FileCode2
} from 'lucide-react';
import { db } from '../services/db';

export const ArchitectureView: React.FC = () => {
  const [copiedRules, setCopiedRules] = useState(false);
  const [copiedIndexes, setCopiedIndexes] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const firestoreRulesSample = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
    match /vehicles/{vehicleId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || resource.data.userId == request.auth.uid) &&
        request.resource.data.userId == request.auth.uid;
    }
    match /expenses/{expenseId} {
      allow read, write: if isAuthenticated() &&
        (resource == null || resource.data.userId == request.auth.uid) &&
        request.resource.data.userId == request.auth.uid &&
        request.resource.data.amount > 0;
    }
    match /maintenanceSchedules/{scheduleId} {
      allow read, write: if isAuthenticated() &&
        (resource == null || resource.data.userId == request.auth.uid) &&
        request.resource.data.userId == request.auth.uid;
    }
    match /maintenanceRecords/{recordId} {
      allow read, write: if isAuthenticated() &&
        (resource == null || resource.data.userId == request.auth.uid) &&
        request.resource.data.userId == request.auth.uid;
    }
    match /reminders/{reminderId} {
      allow read, write: if isAuthenticated() &&
        (resource == null || resource.data.userId == request.auth.uid) &&
        request.resource.data.userId == request.auth.uid;
    }
    match /expenseCategories/{catId} {
      allow read: if isAuthenticated();
      allow write: if false; // Read-only global catalog
    }
    match /expenseSubcategories/{subId} {
      allow read, write: if isAuthenticated();
    }
    match /maintenanceTypes/{typeId} {
      allow read: if isAuthenticated();
      allow write: if false; // System defaults
    }
  }
}`;

  const firestoreIndexesSample = `{
  "indexes": [
    { "collectionGroup": "expenses", "queryScope": "COLLECTION", "fields": [{ "fieldPath": "userId", "order": "ASCENDING" }, { "fieldPath": "date", "order": "DESCENDING" }] },
    { "collectionGroup": "expenses", "queryScope": "COLLECTION", "fields": [{ "fieldPath": "userId", "order": "ASCENDING" }, { "fieldPath": "vehicleId", "order": "ASCENDING" }, { "fieldPath": "date", "order": "DESCENDING" }] },
    { "collectionGroup": "expenses", "queryScope": "COLLECTION", "fields": [{ "fieldPath": "userId", "order": "ASCENDING" }, { "fieldPath": "categoryId", "order": "ASCENDING" }, { "fieldPath": "date", "order": "DESCENDING" }] },
    { "collectionGroup": "maintenanceSchedules", "queryScope": "COLLECTION", "fields": [{ "fieldPath": "userId", "order": "ASCENDING" }, { "fieldPath": "vehicleId", "order": "ASCENDING" }, { "fieldPath": "nextDueDate", "order": "ASCENDING" }] },
    { "collectionGroup": "maintenanceRecords", "queryScope": "COLLECTION", "fields": [{ "fieldPath": "userId", "order": "ASCENDING" }, { "fieldPath": "vehicleId", "order": "ASCENDING" }, { "fieldPath": "serviceDate", "order": "DESCENDING" }] },
    { "collectionGroup": "reminders", "queryScope": "COLLECTION", "fields": [{ "fieldPath": "userId", "order": "ASCENDING" }, { "fieldPath": "status", "order": "ASCENDING" }, { "fieldPath": "dueDate", "order": "ASCENDING" }] }
  ]
}`;

  const handleCopyRules = () => {
    navigator.clipboard.writeText(firestoreRulesSample);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  const handleCopyIndexes = () => {
    navigator.clipboard.writeText(firestoreIndexesSample);
    setCopiedIndexes(true);
    setTimeout(() => setCopiedIndexes(false), 2000);
  };

  const handleExportBackup = () => {
    const jsonStr = db.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fleet_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const res = db.importDataJSON(content);
        if (res.success) {
          setImportStatus('Backup restored successfully! All collections reloaded.');
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus(`Import error: ${res.error}`);
        }
      } catch (err: any) {
        setImportStatus(`Failed to read file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset application to a completely fresh account? All vehicles, expenses, schedules, and reminders will be cleared.')) {
      db.resetDemoData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span>Security Architecture & Database Rules</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Production Firestore rules, multi-user tenancy isolation, composite indexes, and data backup/restore
        </p>
      </div>

      {/* Backup and Restore Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Export JSON Backup */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Full Data Export</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Download complete database snapshot (users, vehicles, expenses, schedules, records, reminders) as a JSON file.
            </p>
          </div>
          <button
            onClick={handleExportBackup}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON Backup</span>
          </button>
        </div>

        {/* Restore Backup */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Restore from Backup</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Import and restore collections from a previously exported JSON backup file.
            </p>
          </div>
          <div>
            <label className="w-full flex items-center justify-center space-x-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 cursor-pointer transition">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Upload Backup JSON</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
            {importStatus && (
              <div className="text-[11px] text-emerald-400 mt-2 text-center font-medium">
                {importStatus}
              </div>
            )}
          </div>
        </div>

        {/* Reset Account Data */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center space-x-2 text-slate-200 font-bold text-sm">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Reset to Clean Account</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Clear all recorded vehicles, expenses, and maintenance schedules to return to a completely fresh zero-state account.
            </p>
          </div>
          <button
            onClick={handleResetDemo}
            className="w-full flex items-center justify-center space-x-2 py-2 bg-slate-800 hover:bg-red-950/40 text-slate-300 hover:text-red-400 rounded-lg text-xs font-semibold border border-slate-700 hover:border-red-500/40 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Account Data</span>
          </button>
        </div>
      </div>

      {/* Security Architecture Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Firestore Security Rules (/firestore.rules)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Enforces multi-user isolation by verifying request.auth.uid == resource.data.userId on every write & read
            </p>
          </div>
          <button
            onClick={handleCopyRules}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition"
          >
            {copiedRules ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedRules ? 'Copied' : 'Copy Rules'}</span>
          </button>
        </div>

        <pre className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs font-mono text-emerald-300/90 overflow-x-auto max-h-64 scrollbar-thin">
          {firestoreRulesSample}
        </pre>
      </div>

      {/* Composite Indexes Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Composite Indexes Configuration (/firestore.indexes.json)</span>
            </h3>
            <p className="text-xs text-slate-400">
              High-performance indexes for sorting expenses by date, querying by vehicleId, and filtering overdue reminders
            </p>
          </div>
          <button
            onClick={handleCopyIndexes}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 transition"
          >
            {copiedIndexes ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedIndexes ? 'Copied' : 'Copy Indexes'}</span>
          </button>
        </div>

        <pre className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs font-mono text-blue-300/90 overflow-x-auto max-h-56 scrollbar-thin">
          {firestoreIndexesSample}
        </pre>
      </div>
    </div>
  );
};
