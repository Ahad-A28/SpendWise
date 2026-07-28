'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Expense } from '../../lib/types';
import { TrendingUp, PlusCircle } from 'lucide-react';

interface SpendingTrendChartProps {
  expenses: Expense[];
  dailyTarget?: number;
  onAddExpense?: () => void;
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  expenses,
  dailyTarget = 70,
  onAddExpense,
}) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dailyMap: Record<number, number> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    dailyMap[d] = 0;
  }

  let totalCurrentMonthSpent = 0;
  expenses.forEach(e => {
    const d = new Date(e.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const dayNum = d.getDate();
      dailyMap[dayNum] = (dailyMap[dayNum] || 0) + e.amount;
      totalCurrentMonthSpent += e.amount;
    }
  });

  const chartData = Object.entries(dailyMap).map(([day, amount]) => ({
    dayNum: Number(day),
    amount,
    target: dailyTarget,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const amt = payload[0].value;
      return (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 shadow-xl text-xs space-y-1">
          <div className="font-semibold text-slate-400">Day {label}</div>
          <div className="text-white font-bold text-sm">Spent: ₹{amt}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Daily Spending Trend</h2>
            <p className="text-xs text-slate-400">Daily expenses vs. ₹{dailyTarget} target ceiling</p>
          </div>
        </div>
      </div>

      {totalCurrentMonthSpent === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 border border-dashed border-slate-800 rounded-xl">
          <p className="text-xs text-slate-400">No daily spending recorded for this month.</p>
          {onAddExpense && (
            <button
              onClick={onAddExpense}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Log Daily Expense
            </button>
          )}
        </div>
      ) : (
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis
                dataKey="dayNum"
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis stroke="#64748B" fontSize={10} tickLine={false} axisLine={false} tickFormatter={val => `₹${val}`} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={dailyTarget} stroke="#F59E0B" strokeDasharray="3 3" />
              <Bar dataKey="amount" fill="#6366F1" radius={[3, 3, 0, 0]} maxBarSize={16} />
              <Line type="monotone" dataKey="amount" stroke="#EC4899" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
