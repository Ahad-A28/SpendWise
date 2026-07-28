'use client';

import React from 'react';
import { DollarSign, TrendingDown, TrendingUp, Activity, Flame } from 'lucide-react';
import { Expense, CategoryBudget, YesterdayComparison } from '../lib/types';
import { calculateTotalSpent, filterExpensesByMonth } from '../lib/analytics';

interface SummaryCardsProps {
  expenses: Expense[];
  budgets: CategoryBudget[];
  yesterdayComparison: YesterdayComparison;
  totalPotentialSavings: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  expenses,
  budgets,
  yesterdayComparison,
  totalPotentialSavings,
}) => {
  const now = new Date();
  const currentMonthExpenses = filterExpensesByMonth(expenses, now.getFullYear(), now.getMonth());
  const currentMonthSpent = calculateTotalSpent(currentMonthExpenses);

  const totalMonthlyBudget = budgets.reduce((sum, b) => sum + b.allocated, 0);
  const budgetPercentage = totalMonthlyBudget > 0 ? Math.min(100, Math.round((currentMonthSpent / totalMonthlyBudget) * 100)) : 0;

  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysLeft = totalDaysInMonth - currentDay;

  const remainingBudget = Math.max(0, totalMonthlyBudget - currentMonthSpent);
  const dailyTargetPace = daysLeft > 0 ? (remainingBudget / daysLeft).toFixed(0) : '0';
  const dailyAverageSpend = Math.round(currentMonthSpent / Math.max(1, currentDay));
  const dailyTargetNum = Number(dailyTargetPace);
  const isOverpacing = dailyAverageSpend > dailyTargetNum;
  const paceStatus = daysLeft === 0
    ? '🎉 Last day of the month!'
    : isOverpacing
    ? `⚠️ You're spending ₹${(dailyAverageSpend - dailyTargetNum).toLocaleString()} more/day than safe`
    : `✅ You're on track — ₹${(dailyTargetNum - dailyAverageSpend).toLocaleString()} buffer/day`;

  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:snap-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* 1. Month Total Spent */}
      <div className="flex-none w-[85vw] max-w-[320px] snap-center sm:w-auto p-5 rounded-2xl glass-card glass-card-hover space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">This Month</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">₹{currentMonthSpent.toLocaleString()}</div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>Budget: ₹{totalMonthlyBudget.toLocaleString()}</span>
            <span className={budgetPercentage > 90 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
              {budgetPercentage}%
            </span>
          </div>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              budgetPercentage > 90
                ? 'bg-rose-500'
                : budgetPercentage > 75
                ? 'bg-amber-400'
                : 'bg-indigo-500'
            }`}
            style={{ width: `${budgetPercentage}%` }}
          />
        </div>
      </div>

      {/* 2. Today vs Yesterday */}
      <div className="flex-none w-[85vw] max-w-[320px] snap-center sm:w-auto p-5 rounded-2xl glass-card glass-card-hover space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Today vs Yesterday</span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              yesterdayComparison.isImproved
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-rose-500/10 text-rose-400'
            }`}
          >
            {yesterdayComparison.isImproved ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">₹{yesterdayComparison.todaySpent}</span>
            <span
              className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                yesterdayComparison.isImproved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {yesterdayComparison.isImproved ? '-' : '+'}
              {Math.abs(yesterdayComparison.percentageChange)}%
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Yesterday: ₹{yesterdayComparison.yesterdaySpent}</p>
        </div>
      </div>

      {/* 3. Daily Average Spend */}
      <div className="flex-none w-[85vw] max-w-[320px] snap-center sm:w-auto p-5 rounded-2xl glass-card glass-card-hover space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Daily Average Spend</span>
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ₹{dailyAverageSpend.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Average spent per day this month</p>
        </div>
      </div>

      {/* 4. Safe to Spend Today */}
      <div className="flex-none w-[85vw] max-w-[320px] snap-center sm:w-auto p-5 rounded-2xl glass-card glass-card-hover space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Safe to Spend Today</span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isOverpacing ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
          }`}>
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ₹{Number(dailyTargetPace).toLocaleString()} <span className="text-base font-normal text-slate-400">/day</span>
          </div>
          <p className="text-xs mt-1.5 leading-snug">
            <span className={isOverpacing ? 'text-rose-400' : daysLeft === 0 ? 'text-indigo-400' : 'text-emerald-500'}>
              {paceStatus}
            </span>
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{daysLeft} days left this month</p>
        </div>
      </div>
    </div>
  );
};
