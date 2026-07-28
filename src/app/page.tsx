'use client';

import React from 'react';
import { Sparkles, Database } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { SummaryCards } from '../components/SummaryCards';
import { calculateYesterdayVsToday, generateSmartReductionInsights } from '../lib/analytics';
import { ExpenseTable } from '../components/Expenses/ExpenseTable';
import { ExpensePieChart } from '../components/Charts/ExpensePieChart';

export default function DashboardPage() {
  const { expenses, budgets, categories, isMounted, handleLoadSampleData, handleDeleteExpense } = useAppContext();

  if (!isMounted) return null;

  const yesterdayComparison = calculateYesterdayVsToday(expenses);
  const insights = generateSmartReductionInsights(expenses, budgets);
  const totalPotentialSavings = insights.reduce((sum, ins) => sum + (ins.potentialSavings || 0), 0);

  const EmptyState = () => (
    <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 text-center space-y-4 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
        <Sparkles className="w-6 h-6" />
      </div>
      <div className="max-w-md mx-auto space-y-1">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Welcome to SpendWise AI</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Add your first transaction or load sample data to explore charts & AI advice.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={handleLoadSampleData}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          <Database className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> Load Sample Data
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {expenses.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
          <div className="xl:col-span-3">
            <SummaryCards
              expenses={expenses}
              budgets={budgets}
              yesterdayComparison={yesterdayComparison}
              totalPotentialSavings={totalPotentialSavings}
            />
          </div>
          <div className="xl:col-span-2">
            <ExpenseTable
              expenses={expenses}
              categories={categories}
              onDeleteExpense={handleDeleteExpense}
            />
          </div>
          <div className="xl:col-span-1">
            <ExpensePieChart expenses={expenses} categories={categories} />
          </div>
        </div>
      )}
    </div>
  );
}
