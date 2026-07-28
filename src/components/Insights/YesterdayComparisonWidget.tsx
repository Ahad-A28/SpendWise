'use client';

import React from 'react';
import { YesterdayComparison } from '../../lib/types';
import { Flame, TrendingDown, Sparkles } from 'lucide-react';

interface YesterdayComparisonWidgetProps {
  comparison: YesterdayComparison;
}

export const YesterdayComparisonWidget: React.FC<YesterdayComparisonWidgetProps> = ({ comparison }) => {
  const { todaySpent, yesterdaySpent, diffAmount, percentageChange, isImproved, streakDays } = comparison;

  return (
    <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div
          className={`p-2.5 rounded-xl ${
            isImproved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
          }`}
        >
          {isImproved ? <TrendingDown className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Daily Improvement Pace</h3>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isImproved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isImproved ? 'Under Control' : 'Tracked'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Today: <strong className="text-white">₹{todaySpent}</strong> • Yesterday:{' '}
            <strong className="text-slate-300">₹{yesterdaySpent}</strong>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3.5 py-2 rounded-xl text-xs">
        <Flame className="w-4 h-4 text-amber-400" />
        <span className="text-slate-400">Streak:</span>
        <span className="font-bold text-amber-300">{streakDays} Days Under Budget</span>
      </div>
    </div>
  );
};
