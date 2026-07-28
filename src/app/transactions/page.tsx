'use client';

import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ExpenseTable } from '../../components/Expenses/ExpenseTable';
import { SpendingComparisonTable } from '../../components/Expenses/SpendingComparisonTable';
import { Download, X } from 'lucide-react';

export default function TransactionsPage() {
  const { expenses, categories, isMounted, handleDeleteExpense } = useAppContext();
  const [isExporting, setIsExporting] = useState(false);
  const [exportStart, setExportStart] = useState('');
  const [exportEnd, setExportEnd] = useState('');

  if (!isMounted) return null;

  const handleExportCSV = () => {
    if (expenses.length === 0) return;

    let filtered = expenses;
    if (exportStart) {
      filtered = filtered.filter(e => new Date(e.date) >= new Date(exportStart));
    }
    if (exportEnd) {
      filtered = filtered.filter(e => new Date(e.date) <= new Date(exportEnd));
    }

    if (filtered.length === 0) {
      alert("No data found for this date range.");
      return;
    }
    const headers = ['ID', 'Title', 'Amount', 'Category', 'Date', 'Payment Method', 'Notes', 'Recurring'];
    const rows = filtered.map(e => [
      e.id,
      `"${e.title.replace(/"/g, '""')}"`,
      e.amount,
      `"${e.category}"`,
      e.date,
      `"${e.paymentMethod}"`,
      `"${e.notes || ''}"`,
      e.isRecurring
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setIsExporting(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Transactions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">View, search, and manage all your logged expenses</p>
        </div>
        
        <button
          onClick={() => setIsExporting(true)}
          disabled={expenses.length === 0}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {isExporting && (
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-in slide-in-from-top-2 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">Export Transactions</h3>
            <button onClick={() => setIsExporting(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Start Date</label>
              <input 
                type={exportStart ? "date" : "text"} 
                placeholder="Start Date"
                value={exportStart} 
                onFocus={(e) => e.target.type = 'date'}
                onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                onChange={e => setExportStart(e.target.value)} 
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300" 
              />
            </div>
            <div className="flex-1 w-full flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">End Date</label>
              <input 
                type={exportEnd ? "date" : "text"} 
                placeholder="End Date"
                value={exportEnd} 
                onFocus={(e) => e.target.type = 'date'}
                onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                onChange={e => setExportEnd(e.target.value)} 
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 dark:text-slate-300" 
              />
            </div>
            <div className="flex-none mt-5">
              <button onClick={handleExportCSV} className="w-full sm:w-auto px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm rounded-lg hover:opacity-90 transition-opacity">
                Download
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">Leave dates blank to export all data.</p>
        </div>
      )}

      <ExpenseTable
        expenses={expenses}
        onDeleteExpense={handleDeleteExpense}
        categories={categories}
      />

      <SpendingComparisonTable
        expenses={expenses}
        categories={categories}
      />
    </div>
  );
}
