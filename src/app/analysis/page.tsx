'use client';

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { MonthComparisonChart } from '../../components/Charts/MonthComparisonChart';
import { calculateMonthOverMonthComparison } from '../../lib/analytics';

export default function AnalysisPage() {
  const { expenses, isMounted } = useAppContext();

  if (!isMounted) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Analysis</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Deep dive into your spending patterns and trends.</p>
      </div>

      {expenses.length > 0 ? (
        <MonthComparisonChart comparisons={calculateMonthOverMonthComparison(expenses)} />
      ) : (
        <div className="p-12 glass-card rounded-2xl flex items-center justify-center text-sm text-slate-500 text-center">
          No data available for analysis. Start logging expenses to see insights!
        </div>
      )}
    </div>
  );
}
