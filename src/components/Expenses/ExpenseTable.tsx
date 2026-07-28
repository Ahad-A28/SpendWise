'use client';

import React, { useState } from 'react';
import { Expense } from '../../lib/types';

import { Search, Trash2, ArrowUpDown, PlusCircle } from 'lucide-react';

interface ExpenseTableProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onAddExpense?: () => void;
  categories: Record<string, { color: string; bg: string; icon: string }>;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  onDeleteExpense,
  onAddExpense,
  categories,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filtered = expenses.filter(e => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || e.category === selectedCategory;
    
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && new Date(e.date) >= new Date(startDate);
    }
    if (endDate) {
      matchesDate = matchesDate && new Date(e.date) <= new Date(endDate);
    }

    return matchesSearch && matchesCat && matchesDate;
  });

  const sorted = [...filtered].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  const sortedDates = expenses.map(e => e.date).sort();
  const todayStr = new Date().toISOString().split('T')[0];
  const earliestDate = sortedDates[0] || '';
  const maxExpenseDate = sortedDates[sortedDates.length - 1] || todayStr;
  const latestDate = maxExpenseDate > todayStr ? todayStr : maxExpenseDate;

  return (
    <div className="p-6 rounded-2xl glass-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">View and manage logged expenses</p>
        </div>
      </div>

      {/* Filter Controls */}
      {expenses.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transactions…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Date range + category — wrap nicely on small screens */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <input
              type={startDate ? "date" : "text"}
              placeholder="Start Date"
              value={startDate}
              min={earliestDate}
              max={endDate || latestDate}
              onFocus={(e) => e.target.type = 'date'}
              onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
              onChange={e => setStartDate(e.target.value)}
              className="flex-1 sm:flex-none sm:w-32 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              title="Start Date"
            />
            <input
              type={endDate ? "date" : "text"}
              placeholder="End Date"
              value={endDate}
              min={startDate || earliestDate}
              max={latestDate}
              onFocus={(e) => e.target.type = 'date'}
              onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
              onChange={e => setEndDate(e.target.value)}
              className="flex-1 sm:flex-none sm:w-32 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              title="End Date"
            />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="flex-1 sm:flex-none sm:w-36 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Categories</option>
              {Object.keys(categories).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Table Content */}
      {expenses.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <p className="text-xs text-slate-500 dark:text-slate-400">No transactions recorded yet. Start tracking by logging an expense.</p>
          {onAddExpense && (
            <button
              onClick={onAddExpense}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Add Expense
            </button>
          )}
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl">
          No expenses match your search query.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 relative">
              <thead className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Title</th>
                  <th className="px-4 py-2.5 font-semibold">Category</th>
                  <th className="px-4 py-2.5 font-semibold">Date</th>
                  <th className="px-4 py-2.5 font-semibold">Payment</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Amount</th>
                  <th className="px-4 py-2.5 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {sorted.map(expense => {
                  const catMeta = categories[expense.category];
                  return (
                    <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {expense.title}
                        {expense.notes && <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">{expense.notes}</div>}
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: catMeta?.color }} />
                          {expense.category}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{expense.date}</td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{expense.paymentMethod}</td>

                      <td className="px-4 py-3 text-right font-extrabold text-slate-900 dark:text-white text-xs whitespace-nowrap">
                        ₹{expense.amount.toFixed(2)}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => onDeleteExpense(expense.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile List View */}
          <div className="block md:hidden space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {sorted.map(expense => {
              const catMeta = categories[expense.category];
              return (
                <div key={expense.id} className="p-3 border border-slate-100 dark:border-slate-800/60 rounded-xl bg-white dark:bg-slate-900/40 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{expense.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {expense.date} &bull; {expense.paymentMethod}
                      </p>
                      {expense.notes && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 italic">{expense.notes}</p>}
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">₹{expense.amount.toFixed(2)}</div>
                      <button 
                        onClick={() => onDeleteExpense(expense.id)} 
                        className="text-slate-400 hover:text-rose-400 p-1 mt-1 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catMeta?.color }} />
                      {expense.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
