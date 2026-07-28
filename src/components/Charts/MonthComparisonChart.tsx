'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { MonthComparison } from '../../lib/types';
import { BarChart3 } from 'lucide-react';
import { useTheme } from 'next-themes';

interface MonthComparisonChartProps {
  comparisons: MonthComparison[];
}

export const MonthComparisonChart: React.FC<MonthComparisonChartProps> = ({ comparisons }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const gridColor = isDark ? '#1E293B' : '#E2E8F0';
  const textColor = isDark ? '#64748B' : '#94A3B8';

  const activeComparisons = comparisons.filter(c => c.currentMonthSpent > 0 || c.previousMonthSpent > 0);

  const data = activeComparisons
    .sort((a, b) => (b.currentMonthSpent + b.previousMonthSpent) - (a.currentMonthSpent + a.previousMonthSpent))
    .map(c => ({
      category: c.category.replace(' & ', '/'),
      fullCategory: c.category,
      PreviousMonth: c.previousMonthSpent,
      CurrentMonth: c.currentMonthSpent,
      percentageChange: c.percentageChange,
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="p-3 rounded-xl glass-card shadow-xl text-xs space-y-1">
          <div className="font-bold text-slate-900 dark:text-white">{item.fullCategory}</div>
          <div className="text-slate-500 dark:text-slate-400">Previous Month: <span className="text-slate-700 dark:text-slate-200 font-semibold">₹{item.PreviousMonth}</span></div>
          <div className="text-slate-500 dark:text-slate-400">Current Month: <span className="text-slate-900 dark:text-white font-bold">₹{item.CurrentMonth}</span></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl glass-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Month-over-Month Comparison</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Current vs Previous month by category</p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          Log expenses across different months to compare spending trends.
        </div>
      ) : (
        <div className="w-full overflow-x-auto pb-2 custom-scrollbar">
          <div className="h-60 min-w-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="category" stroke={textColor} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={textColor} fontSize={10} tickLine={false} axisLine={false} tickFormatter={val => `₹${val}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }} />
                <Bar dataKey="PreviousMonth" fill="#475569" radius={[3, 3, 0, 0]} maxBarSize={30} />
                <Bar dataKey="CurrentMonth" fill="#10B981" radius={[3, 3, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
