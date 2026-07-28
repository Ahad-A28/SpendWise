'use client';

import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { GoalCard } from '../../components/Goals/GoalCard';
import { AddGoalModal } from '../../components/Modals/AddGoalModal';
import { ContributeModal } from '../../components/Modals/ContributeModal';
import { Plus, Target } from 'lucide-react';
import { Goal } from '../../lib/types';

export default function GoalsPage() {
  const { goals, handleAddGoal, handleDeleteGoal, handleContributeToGoal, isMounted } = useAppContext();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [contributeGoal, setContributeGoal] = useState<Goal | null>(null);

  if (!isMounted) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Savings Goals</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track your progress towards your financial targets.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-sm shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="p-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">No active goals</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">Create a savings goal to track your progress for vacations, emergencies, or big purchases.</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onContribute={(g) => setContributeGoal(g)}
              onDelete={handleDeleteGoal}
            />
          ))}
        </div>
      )}

      <AddGoalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddGoal={handleAddGoal}
      />

      <ContributeModal
        goal={contributeGoal}
        onClose={() => setContributeGoal(null)}
        onContribute={handleContributeToGoal}
      />
    </div>
  );
}
