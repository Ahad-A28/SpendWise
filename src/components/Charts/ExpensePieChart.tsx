'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from 'next-themes';
import { Expense, CategoryType } from '../../lib/types';
import { PieChart as PieIcon, PlusCircle } from 'lucide-react';

interface ExpensePieChartProps {
  expenses: Expense[];
  onAddExpense?: () => void;
  categories: Record<string, { color: string; bg: string; icon: string }>;
}

export const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ expenses, onAddExpense, categories }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { theme, systemTheme } = useTheme();
  
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const strokeColor = currentTheme === 'dark' ? '#0F172A' : '#ffffff';

  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  const data = Object.entries(categoryTotals)
    .map(([name, value]) => ({
      name: name as CategoryType,
      value,
      percentage: totalSpent > 0 ? ((value / totalSpent) * 100).toFixed(1) : '0',
      color: categories[name as CategoryType]?.color || '#6B7280',
    }))
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="p-3 rounded-xl glass-card shadow-xl text-xs space-y-1">
          <div className="font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}
          </div>
          <div className="text-slate-700 dark:text-slate-300 font-bold">₹{item.value.toLocaleString()} ({item.percentage}%)</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl glass-card flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Category Allocation</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Spending breakdown</p>
          </div>
        </div>
        {totalSpent > 0 && (
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            ₹{totalSpent.toLocaleString()}
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <p className="text-xs text-slate-500 dark:text-slate-400">No expenses logged yet.</p>
          {onAddExpense && (
            <button
              onClick={onAddExpense}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Add First Expense
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={strokeColor}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800/80 text-xs">
            {data.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/30">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
                </div>
                <span className="text-slate-500 dark:text-slate-400 font-semibold">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
