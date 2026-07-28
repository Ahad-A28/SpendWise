'use client';

import React from 'react';
import { SettingsView } from '../../components/Settings/SettingsView';
import { useAppContext } from '../../context/AppContext';

export default function BudgetingPage() {
  const { budgets, handleSaveBudgets, categories, handleSaveCategories, isMounted } = useAppContext();

  if (!isMounted) return null;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
      <SettingsView
        budgets={budgets}
        onSaveBudgets={handleSaveBudgets}
        categories={categories}
        onSaveCategories={handleSaveCategories}
      />
    </div>
  );
}
