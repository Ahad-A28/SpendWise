'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppContext } from '../../context/AppContext';
import { AiChatBot } from '../../components/AI/AiChatBot';

function AiChatBotWrapper() {
  const { expenses, budgets, categories, isMounted } = useAppContext();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';

  if (!isMounted) return null;

  return <AiChatBot expenses={expenses} budgets={budgets} categories={categories} initialPrompt={initialPrompt} />;
}

export default function AiPage() {
  return (
    <div className="w-full h-full max-w-6xl mx-auto flex flex-col animate-in fade-in duration-300">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
          Loading AI...
        </div>
      }>
        <AiChatBotWrapper />
      </Suspense>
    </div>
  );
}
