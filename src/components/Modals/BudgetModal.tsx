'use client';

import React, { useState } from 'react';
import { CategoryBudget } from '../../lib/types';
import { X, Target, Save } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: CategoryBudget[];
  onSaveBudgets: (budgets: CategoryBudget[]) => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  budgets,
  onSaveBudgets,
}) => {
  const [budgetList, setBudgetList] = useState<CategoryBudget[]>(budgets);

  if (!isOpen) return null;

  const handleValueChange = (index: number, val: string) => {
    const num = parseFloat(val) || 0;
    const updated = [...budgetList];
    updated[index] = { ...updated[index], allocated: num };
    setBudgetList(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBudgets(budgetList);
    onClose();
  };

  const totalAllocated = budgetList.reduce((sum, b) => sum + b.allocated, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Category Budget Planner</h2>
              <p className="text-xs text-slate-400">Set spending caps to receive intelligent overbudget alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Total Monthly Allocated Budget:</span>
            <span className="text-base font-extrabold text-white">₹{totalAllocated.toLocaleString()}</span>
          </div>

          <div className="space-y-2">
            {budgetList.map((item, idx) => (
              <div
                key={item.category}
                className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <span className="text-xs font-semibold text-slate-300 w-1/2">{item.category}</span>
                <div className="relative w-1/2">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={item.allocated}
                    onChange={e => handleValueChange(idx, e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-lg shadow-purple-600/30 transition-all"
            >
              <Save className="w-4 h-4" /> Save Budgets
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
