import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Tag, 
  FolderPlus, 
  Check, 
  X, 
  Fuel, 
  Wrench, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  DollarSign, 
  UserCheck, 
  HelpCircle,
  Car
} from 'lucide-react';
import { db } from '../services/db';
import { ExpenseCategory, ExpenseSubcategory } from '../types';

interface CategoriesViewProps {
  categories: ExpenseCategory[];
  subcategories: ExpenseSubcategory[];
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  subcategories,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories.length > 0 ? categories[0].categoryId : ''
  );
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');

  const activeCategory = categories.find((c) => c.categoryId === selectedCategory);
  const activeSubcategories = subcategories.filter((s) => s.categoryId === selectedCategory);

  const handleCreateSubcategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !selectedCategory) return;

    db.createSubcategory({
      categoryId: selectedCategory,
      name: newSubName.trim(),
      description: newSubDesc.trim() || undefined,
      isActive: true,
      sortOrder: activeSubcategories.length + 1,
    });

    setNewSubName('');
    setNewSubDesc('');
    setShowAddSubModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>Database Categories & Subcategories</span>
          </h2>
          <p className="text-xs text-slate-400">
            Dynamically loaded from database collections (not hardcoded) — add new subcategories directly
          </p>
        </div>

        <button
          onClick={() => setShowAddSubModal(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subcategory</span>
        </button>
      </div>

      {/* Two Column Layout: Categories List on Left, Subcategories on Right */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Categories Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Expense Categories ({categories.length})
          </div>

          <div className="space-y-1">
            {categories.map((cat) => {
              const isSelected = cat.categoryId === selectedCategory;
              const subCount = subcategories.filter((s) => s.categoryId === cat.categoryId).length;

              return (
                <button
                  key={cat.categoryId}
                  onClick={() => setSelectedCategory(cat.categoryId)}
                  className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                      : 'hover:bg-slate-800/80 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Tag className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-semibold">{cat.name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {subCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcategories Column */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
          {activeCategory && (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                    <span>{activeCategory.name} Subcategories</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{activeCategory.description}</p>
                </div>
                <button
                  onClick={() => setShowAddSubModal(true)}
                  className="flex items-center space-x-1 text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>New Subcategory</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {activeSubcategories.map((sub) => (
                  <div
                    key={sub.subcategoryId}
                    className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">{sub.name}</span>
                        <span className="text-[9px] font-mono text-slate-500">{sub.subcategoryId}</span>
                      </div>
                      {sub.description && (
                        <p className="text-[11px] text-slate-400 mt-1">{sub.description}</p>
                      )}
                    </div>
                    <div className="mt-2 text-[10px] text-emerald-400/80 flex items-center space-x-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Active for {activeCategory.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Add Subcategory Modal */}
      {showAddSubModal && activeCategory && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl text-slate-100">
            <h3 className="text-base font-bold text-slate-100 mb-1">
              Add Subcategory to {activeCategory.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Create a custom subcategory that will be instantly available in the expense logging dropdown.
            </p>

            <form onSubmit={handleCreateSubcategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subcategory Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Synthetic Engine Oil"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Premium 5W-30 synthetic motor lubricant"
                  value={newSubDesc}
                  onChange={(e) => setNewSubDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddSubModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                >
                  Save Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
