'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Expense } from '../../lib/types';
import { filterExpensesByMonth } from '../../lib/analytics';
import { TrendingDown, TrendingUp, Minus, ChevronDown, ChevronUp, BarChart2, Sparkles } from 'lucide-react';

interface SpendingComparisonTableProps {
  expenses: Expense[];
  categories: Record<string, { color: string; bg: string; icon: string }>;
}

type CompareMode = 'month' | 'week';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getWeekRange(offsetWeeks: number) {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - day);
  startOfThisWeek.setHours(0, 0, 0, 0);

  const start = new Date(startOfThisWeek);
  start.setDate(start.getDate() - offsetWeeks * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function spendInRange(expenses: Expense[], start: Date, end: Date) {
  return expenses.filter(e => {
    const d = new Date(e.date);
    return d >= start && d <= end;
  }).reduce((sum, e) => sum + e.amount, 0);
}

function spendByCategory(expenses: Expense[], start: Date, end: Date, cats: string[]) {
  const rangeExp = expenses.filter(e => {
    const d = new Date(e.date);
    return d >= start && d <= end;
  });
  return Object.fromEntries(cats.map(c => [c, rangeExp.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0)]));
}

export const SpendingComparisonTable: React.FC<SpendingComparisonTableProps> = ({ expenses, categories }) => {
  const [mode, setMode] = useState<CompareMode>('month');
  const [expanded, setExpanded] = useState(true);
  const router = useRouter();

  const now = new Date();
  const cats = useMemo(() => Object.keys(categories), [categories]);

  // ── Month mode ──────────────────────────────────────────
  const currentMonthLabel = MONTH_NAMES[now.getMonth()];
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthLabel = MONTH_NAMES[prevMonthDate.getMonth()];

  const currentMonthExp = filterExpensesByMonth(expenses, now.getFullYear(), now.getMonth());
  const prevMonthExp = filterExpensesByMonth(expenses, prevMonthDate.getFullYear(), prevMonthDate.getMonth());

  const currentMonthTotal = currentMonthExp.reduce((s, e) => s + e.amount, 0);
  const prevMonthTotal = prevMonthExp.reduce((s, e) => s + e.amount, 0);

  const currentMonthByCat = useMemo(() =>
    Object.fromEntries(cats.map(c => [c, currentMonthExp.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0)])),
    [cats, currentMonthExp]
  );
  const prevMonthByCat = useMemo(() =>
    Object.fromEntries(cats.map(c => [c, prevMonthExp.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0)])),
    [cats, prevMonthExp]
  );

  // ── Week mode ────────────────────────────────────────────
  const { start: thisWeekStart, end: thisWeekEnd } = getWeekRange(0);
  const { start: lastWeekStart, end: lastWeekEnd } = getWeekRange(1);

  const thisWeekTotal = spendInRange(expenses, thisWeekStart, thisWeekEnd);
  const lastWeekTotal = spendInRange(expenses, lastWeekStart, lastWeekEnd);

  const thisWeekByCat = useMemo(() => spendByCategory(expenses, thisWeekStart, thisWeekEnd, cats), [expenses, cats]);
  const lastWeekByCat = useMemo(() => spendByCategory(expenses, lastWeekStart, lastWeekEnd, cats), [expenses, cats]);

  // ── Select mode values ───────────────────────────────────
  const labelA = mode === 'month' ? prevMonthLabel : 'Last Week';
  const labelB = mode === 'month' ? currentMonthLabel : 'This Week';
  const totalA = mode === 'month' ? prevMonthTotal : lastWeekTotal;
  const totalB = mode === 'month' ? currentMonthTotal : thisWeekTotal;
  const catA = mode === 'month' ? prevMonthByCat : lastWeekByCat;
  const catB = mode === 'month' ? currentMonthByCat : thisWeekByCat;

  const totalDiff = totalB - totalA;
  const totalPct = totalA > 0 ? ((totalDiff / totalA) * 100).toFixed(1) : totalB > 0 ? '100' : '0';
  const totalImproved = totalDiff <= 0;

  // Build categories that got worse — used for the AI tip prompt
  const worseCategories = useMemo(() => {
    return cats
      .filter(cat => {
        const a = catA[cat] || 0;
        const b = catB[cat] || 0;
        return b > a && b > 0;
      })
      .map(cat => {
        const a = catA[cat] || 0;
        const b = catB[cat] || 0;
        return { cat, diff: b - a, b };
      })
      .sort((x, y) => y.diff - x.diff)
      .slice(0, 3); // top 3 worst categories
  }, [cats, catA, catB]);

  const handleAiTips = () => {
    const period = mode === 'month' ? `this month vs ${labelA}` : 'this week vs last week';
    const catLines = worseCategories
      .map(({ cat, b, diff }) => `- ${cat}: ₹${b.toLocaleString()} (up by ₹${diff.toLocaleString()})`)
      .join('\n');
    const prompt = `My spending has gone up ${period}. Here are my worst categories:\n${catLines}\n\nGive me practical tips to reduce spending in these areas.`;
    router.push(`/ai?prompt=${encodeURIComponent(prompt)}`);
  };

  // Rows: only show categories that had any spend in either period
  const rows = cats
    .map(cat => ({
      cat,
      a: catA[cat] || 0,
      b: catB[cat] || 0,
      diff: (catB[cat] || 0) - (catA[cat] || 0),
      pct: catA[cat] > 0 ? (((catB[cat] || 0) - catA[cat]) / catA[cat] * 100).toFixed(1) : catB[cat] > 0 ? '100' : '0',
      improved: (catB[cat] || 0) <= (catA[cat] || 0),
    }))
    .filter(r => r.a > 0 || r.b > 0)
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

  if (expenses.length === 0) return null;

  return (
    <div className="rounded-2xl glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Spending Comparison</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">See improvements across categories</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setMode('month')}
              className={`px-3 py-1.5 rounded-[10px] transition-all ${mode === 'month' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >Monthly</button>
            <button
              onClick={() => setMode('week')}
              className={`px-3 py-1.5 rounded-[10px] transition-all ${mode === 'week' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >Weekly</button>
          </div>
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <>
          {/* Summary banner */}
          <div className={`px-5 py-3 border-b border-slate-100 dark:border-slate-800 ${totalImproved ? 'bg-emerald-50 dark:bg-emerald-500/5' : 'bg-rose-50 dark:bg-rose-500/5'}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {labelB} total:{' '}
                <span className="font-extrabold text-slate-900 dark:text-white">₹{totalB.toLocaleString()}</span>
              </span>
              <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${totalImproved ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                {totalImproved ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                {totalImproved
                  ? `${Math.abs(Number(totalPct))}% less than ${labelA}`
                  : `${Math.abs(Number(totalPct))}% more than ${labelA}`}
              </span>
            </div>

            {/* AI Tips CTA — only when spending is higher */}
            {!totalImproved && worseCategories.length > 0 && (
              <div className="mt-2.5 flex items-center justify-between gap-3 rounded-xl bg-white dark:bg-slate-800/60 border border-rose-100 dark:border-rose-500/20 px-3.5 py-2.5">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    🤖 Want tips to cut down spending?
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    AI will analyse your top overspent categories and give practical advice.
                  </p>
                </div>
                <button
                  onClick={handleAiTips}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Get AI Tips
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          {rows.length === 0 ? (
            <div className="px-5 py-12 text-center text-xs text-slate-400 dark:text-slate-500">
              No spending data found for the compared periods.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                    <th className="px-5 py-2.5 text-left font-semibold text-slate-500 dark:text-slate-400">Category</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{labelA}</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{labelB}</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-slate-500 dark:text-slate-400">Change</th>
                    <th className="px-5 py-2.5 text-center font-semibold text-slate-500 dark:text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {rows.map(row => {
                    const catMeta = categories[row.cat];
                    const isNew = row.a === 0 && row.b > 0;
                    const isGone = row.b === 0 && row.a > 0;
                    const noChange = row.diff === 0;

                    return (
                      <tr key={row.cat} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                        {/* Category */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: catMeta?.color ?? '#94a3b8' }}
                            />
                            <span className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">{row.cat}</span>
                          </div>
                        </td>

                        {/* Period A */}
                        <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                          {row.a > 0 ? `₹${row.a.toLocaleString()}` : <span className="text-slate-300 dark:text-slate-600">—</span>}
                        </td>

                        {/* Period B */}
                        <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {row.b > 0 ? `₹${row.b.toLocaleString()}` : <span className="text-slate-300 dark:text-slate-600">—</span>}
                        </td>

                        {/* Diff */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {noChange ? (
                            <span className="text-slate-400 dark:text-slate-500">No change</span>
                          ) : isNew ? (
                            <span className="text-amber-500 font-bold">New</span>
                          ) : isGone ? (
                            <span className="text-slate-400">Cleared</span>
                          ) : (
                            <span className={`font-bold ${row.improved ? 'text-emerald-500' : 'text-rose-400'}`}>
                              {row.improved ? '−' : '+'}₹{Math.abs(row.diff).toLocaleString()}
                              <span className="ml-1 font-normal opacity-70">({Math.abs(Number(row.pct))}%)</span>
                            </span>
                          )}
                        </td>

                        {/* Status badge */}
                        <td className="px-5 py-3 text-center">
                          {noChange ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                              <Minus className="w-3 h-3" /> Same
                            </span>
                          ) : isNew ? (
                            <span className="inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                              New
                            </span>
                          ) : isGone ? (
                            <span className="inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              ✅ Cleared
                            </span>
                          ) : row.improved ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <TrendingDown className="w-3 h-3" /> Saved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
                              <TrendingUp className="w-3 h-3" /> Up
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* Footer total row */}
                <tfoot>
                  <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
                    <td className="px-5 py-3 font-bold text-slate-700 dark:text-slate-300">Total</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {totalA > 0 ? `₹${totalA.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                      ₹{totalB.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {totalA > 0 && (
                        <span className={`font-extrabold ${totalImproved ? 'text-emerald-500' : 'text-rose-400'}`}>
                          {totalImproved ? '−' : '+'}₹{Math.abs(totalDiff).toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {totalA > 0 && (
                        totalImproved
                          ? <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><TrendingDown className="w-3 h-3" /> Better</span>
                          : <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"><TrendingUp className="w-3 h-3" /> Higher</span>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
