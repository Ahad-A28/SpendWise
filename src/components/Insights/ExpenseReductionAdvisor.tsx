'use client';

import React from 'react';
import { SpendingInsight, MonthComparison } from '../../lib/types';
import { Sparkles, Lightbulb, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ExpenseReductionAdvisorProps {
  insights: SpendingInsight[];
  monthComparisons: MonthComparison[];
}

export const ExpenseReductionAdvisor: React.FC<ExpenseReductionAdvisorProps> = ({
  insights,
  monthComparisons,
}) => {
  const topSpikes = monthComparisons.filter(m => m.isSpike || m.percentageChange > 20);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">AI Savings & Reduction Advisor</h2>
            <p className="text-xs text-slate-400">Smart analysis of your habits and actionable ways to save</p>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-start gap-2">
        <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Privacy Note:</strong> This AI Advisor uses a local, rule-based algorithmic engine to analyze your spending. Your data is <strong>never</strong> sent to external servers or LLMs.
        </p>
      </div>

      {/* Spikes Warning Banner if any */}
      {topSpikes.length > 0 && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>
            Spike detected in <strong>{topSpikes.map(s => s.category).join(', ')}</strong> compared to last month.
          </span>
        </div>
      )}

      {/* Insights Grid */}
      {insights.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl">
          Log more expenses over time to receive personalized AI cost-reduction insights.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map(ins => (
            <div
              key={ins.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white">{ins.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">
                    {ins.impactScore} Impact
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{ins.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-indigo-300 font-medium truncate pr-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span className="truncate">{ins.actionableStep}</span>
                </div>
                {ins.potentialSavings > 0 && (
                  <span className="font-bold text-emerald-400 flex-shrink-0">+₹{ins.potentialSavings}/mo</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
