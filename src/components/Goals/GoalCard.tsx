'use client';

import React from 'react';
import { Goal } from '../../lib/types';
import { Target, Calendar, Plus, Trash2 } from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
  onContribute: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onContribute, onDelete }) => {
  const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const isComplete = goal.currentAmount >= goal.targetAmount;
  
  const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));

  return (
    <div className={`p-5 rounded-2xl border ${isComplete ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50' : 'glass-card border-transparent'} relative group transition-all`}>
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDelete(goal.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm`} style={{ backgroundColor: `${goal.color}20` }}>
          {goal.icon}
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{goal.title}</h3>
          <div className="flex flex-col gap-1 mt-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Target className="w-3 h-3" /> ₹{goal.targetAmount.toLocaleString()}
            </p>
            {goal.autoSaveAmount ? (
              <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-500/10 w-fit px-1.5 py-0.5 rounded">
                ⚡ ₹{goal.autoSaveAmount.toLocaleString()}/mo
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              ₹{goal.currentAmount.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">saved</span>
          </div>
          <span className={`text-sm font-bold ${isComplete ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
            {progress}%
          </span>
        </div>
        
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
            style={{ width: `${progress}%`, backgroundColor: isComplete ? undefined : goal.color }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          {isComplete ? 'Goal Reached!' : `${daysLeft} days left`}
        </div>
        {!isComplete && (
          <button
            onClick={() => onContribute(goal)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        )}
      </div>
    </div>
  );
};
