'use client';

import React, { useState } from 'react';
import { CategoryBudget } from '../../lib/types';
import { Save, Plus, Tag, IndianRupee, Trash2, X } from 'lucide-react';

interface SettingsViewProps {
  budgets: CategoryBudget[];
  onSaveBudgets: (b: CategoryBudget[]) => void;
  categories: Record<string, { color: string; bg: string; icon: string }>;
  onSaveCategories: (c: Record<string, { color: string; bg: string; icon: string }>) => void;
}

const PRESET_COLORS = [
  { color: '#F59E0B', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { color: '#6366F1', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { color: '#EC4899', bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  { color: '#10B981', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { color: '#3B82F6', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { color: '#8B5CF6', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({ budgets, onSaveBudgets, categories, onSaveCategories }) => {
  const [localBudgets, setLocalBudgets] = useState<CategoryBudget[]>(budgets);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  React.useEffect(() => {
    setLocalBudgets(budgets);
  }, [budgets]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);

  const handleBudgetChange = (categoryName: string, value: string) => {
    const num = parseFloat(value) || 0;
    setLocalBudgets(prev => prev.map(b => (b.category === categoryName ? { ...b, allocated: num } : b)));
  };

  const handleAddCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    
    if (categories[name]) {
      alert('Category already exists!');
      return;
    }
    
    // Add to categories
    const updatedCategories = {
      ...categories,
      [name]: { color: newCatColor.color, bg: newCatColor.bg, icon: 'Tag' }
    };
    
    try {
      onSaveCategories(updatedCategories);
    } catch (err) {
      console.error(err);
      alert('Failed to save category!');
    }

    // Add empty budget for new category
    setLocalBudgets(prev => [...prev, { id: `temp-${Date.now()}`, category: name, allocated: 0, spent: 0, userId: 'local', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as any]);
    
    setNewCatName('');
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = (catName: string) => {
    if (Object.keys(categories).length <= 1) return; // don't delete last category
    
    const updatedCategories = { ...categories };
    delete updatedCategories[catName];
    onSaveCategories(updatedCategories);
    
    setLocalBudgets(prev => prev.filter(b => b.category !== catName));
  };

  const handleSaveAll = () => {
    onSaveBudgets(localBudgets);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Settings & Budgets</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage your custom categories and monthly budget limits.</p>
        </div>
        <button
          onClick={handleSaveAll}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm sm:text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm transition-all"
        >
          <Save className="w-4 h-4" /> Save Budgets
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budgets Section */}
        <div className="p-5 rounded-2xl glass-card space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <IndianRupee className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Budgets</h3>
          </div>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {localBudgets.map(b => (
              <div key={b.category} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-full sm:w-1/2 truncate">{b.category}</span>
                <div className="relative w-full sm:w-1/2">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={b.allocated || ''}
                    onChange={e => handleBudgetChange(b.category, e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Section */}
        <div className="p-5 rounded-2xl glass-card space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500">
                <Tag className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Categories</h3>
            </div>
            {!isAddingCategory && (
              <button onClick={() => setIsAddingCategory(true)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {isAddingCategory && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">New Category</span>
                <button onClick={() => setIsAddingCategory(false)} className="text-slate-400 hover:text-rose-500"><X className="w-4 h-4" /></button>
              </div>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category Name"
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
              <div className="flex gap-2 pt-1">
                {PRESET_COLORS.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setNewCatColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${newCatColor.color === c.color ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c.color }}
                  />
                ))}
              </div>
              <button type="button" onClick={handleAddCategory} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl mt-2">
                Add Category
              </button>
            </div>
          )}

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {Object.keys(categories).map(cat => {
              const meta = categories[cat];
              return (
                <div key={cat} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.color }} />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{cat}</span>
                  </div>
                  <button onClick={() => handleDeleteCategory(cat)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors" title="Delete Category">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
