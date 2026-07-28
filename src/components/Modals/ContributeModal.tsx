'use client';

import React, { useState } from 'react';
import { X, Wallet } from 'lucide-react';
import { Goal } from '../../lib/types';

interface ContributeModalProps {
  goal: Goal | null;
  onClose: () => void;
  onContribute: (id: string, amount: number) => Promise<void>;
}

export const ContributeModal: React.FC<ContributeModalProps> = ({ goal, onClose, onContribute }) => {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!goal) return null;

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onContribute(goal.id, Number(amount));
    setIsSubmitting(false);
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add Funds</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl flex items-center justify-center text-2xl bg-indigo-50 dark:bg-indigo-500/10 mb-3">
              {goal.icon}
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{goal.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Remaining to target: <span className="font-bold text-slate-700 dark:text-slate-300">₹{remaining.toLocaleString()}</span></p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Contribution Amount (₹)</label>
            <div className="relative">
              <Wallet className="w-5 h-5 text-indigo-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                required
                min="1"
                max={remaining + 10000} // allow slight overfunding
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border-2 border-indigo-100 dark:border-indigo-900/50 text-slate-900 dark:text-white text-xl font-bold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !amount || Number(amount) <= 0}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Confirm Contribution'}
          </button>
        </form>
      </div>
    </div>
  );
};
