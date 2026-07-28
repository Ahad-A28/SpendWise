'use client';

import React, { useState } from 'react';
import { Expense, CategoryType, PaymentMethod } from '../../lib/types';
import { getTodayStr } from '../../lib/storage';
import { X, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  categories: Record<string, { color: string; bg: string; icon: string }>;
}

const PAYMENT_METHODS: PaymentMethod[] = ['UPI / Digital', 'Cash', 'Credit Card', 'Debit Card', 'Bank Transfer'];

const PAYMENT_ICONS: Record<string, string> = {
  'UPI / Digital': '📱',
  'Cash': '💵',
  'Credit Card': '💳',
  'Debit Card': '🏦',
  'Bank Transfer': '🔁',
};

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onAddExpense, categories }) => {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryType>('Food & Dining');
  const [date, setDate] = useState(getTodayStr());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI / Digital');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid expense title and amount.');
      return;
    }

    onAddExpense({
      type,
      title: title.trim(),
      amount: numAmount,
      category,
      date,
      paymentMethod,
      notes: notes.trim() || undefined,
      isRecurring,
    });

    try {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    } catch (e) { /* ignore */ }

    setType('expense');
    setTitle('');
    setAmount('');
    setNotes('');
    setIsRecurring(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[88vh] animate-in slide-in-from-bottom-4 sm:fade-in duration-300">

        {/* Drag Handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 sm:pt-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">New Transaction</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Fill in the details below</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Amount Hero */}
        <div className="mx-5 mb-4 rounded-2xl bg-indigo-600 px-5 py-4">
          <p className="text-indigo-200 text-xs font-medium mb-1.5">Amount</p>
          <div className="flex items-center gap-2">
            <span className="text-white text-2xl font-light">₹</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="flex-1 bg-transparent text-white text-3xl font-bold placeholder-indigo-300 focus:outline-none w-full"
              autoFocus
            />
          </div>
        </div>

        {/* Scrollable Body */}
        <form id="add-expense-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 space-y-5 pb-2">

          {/* Type Toggle */}
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${type === 'expense' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${type === 'income' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Income
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">What was it for?</label>
            <input
              type="text"
              required
              placeholder="e.g. Grocery store, Netflix…"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          {/* Category — horizontal scroll */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Category</label>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-5 px-5">
              {Object.keys(categories).map(cat => {
                const isSelected = category === cat;
                const catInfo = categories[cat] || { icon: '🏷️' };
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat as CategoryType)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-sm">{catInfo.icon}</span>
                    <span className="whitespace-nowrap">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method — horizontal scroll */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Payment</label>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-5 px-5">
              {PAYMENT_METHODS.map(pm => {
                const isSelected = paymentMethod === pm;
                return (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPaymentMethod(pm)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-sm">{PAYMENT_ICONS[pm]}</span>
                    <span className="whitespace-nowrap">{pm}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date + Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Notes</label>
              <input
                type="text"
                placeholder="Optional…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          {/* Recurring toggle */}
          <label className="flex items-center justify-between cursor-pointer pb-1">
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Recurring</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Monthly bill or subscription</p>
            </div>
            <div
              onClick={() => setIsRecurring(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${isRecurring ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isRecurring ? 'translate-x-5' : ''}`} />
            </div>
          </label>

        </form>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            form="add-expense-form"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-[.98]"
          >
            <Check className="w-4 h-4" />
            Save {type === 'expense' ? 'Expense' : 'Income'}
          </button>
        </div>

      </div>
    </div>
  );
};
