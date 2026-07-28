'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Coins, Lock, Unlock, RefreshCw, Plus, Zap, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

interface AdminStats {
  credits: number;
  requestCount: number;
  isLocked: boolean;
  isRateLimited: boolean;
  rateLimitRemainingMinutes: number;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"));

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [customCredits, setCustomCredits] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      showToast('Failed to fetch stats', 'error');
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const sendAction = async (action: string, value?: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, value }),
      });
      const data = await res.json();
      if (data.success) {
        setStats(prev => prev ? { ...prev, ...data.data } : null);
        showToast('Action applied successfully!', 'success');
        fetchStats();
      } else {
        showToast('Action failed.', 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCredits = (amount: number) => sendAction('addCredits', amount);
  const handleSetCredits = () => {
    const val = Number(customCredits);
    if (isNaN(val) || val < 0) return showToast('Invalid credit amount.', 'error');
    sendAction('setCredits', val);
    setCustomCredits('');
  };
  const handleToggleLock = () => sendAction('setLocked', stats?.isLocked ? 0 : 1);
  const handleResetRateLimit = () => sendAction('resetRateLimit');

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 p-4 sm:p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Control Panel</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage AI credits, lock status & system health</p>
        </div>
        <button onClick={fetchStats} className="ml-auto p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats Cards */}
      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">AI Credits</span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.credits.toLocaleString()}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Requests (5hr window)</span>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{stats.requestCount}<span className="text-sm font-normal text-slate-400 ml-1">/ 500</span></p>
          </div>

          <div className={`p-5 rounded-2xl border shadow-sm ${stats.isRateLimited ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className={`w-4 h-4 ${stats.isRateLimited ? 'text-orange-500' : 'text-emerald-500'}`} />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Rate Limit</span>
            </div>
            <p className={`text-lg font-extrabold ${stats.isRateLimited ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {stats.isRateLimited ? `Blocked (${stats.rateLimitRemainingMinutes}m left)` : 'Clear ✓'}
            </p>
          </div>
        </div>
      ) : (
        <div className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      )}

      {/* Master Lock Toggle */}
      <div className={`p-6 rounded-2xl border-2 transition-all ${stats?.isLocked ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-400 dark:border-rose-700' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {stats?.isLocked
              ? <Lock className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              : <Unlock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                {stats?.isLocked ? '🔴 AI Chatbot is LOCKED' : '🟢 AI Chatbot is ACTIVE'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {stats?.isLocked
                  ? 'Users cannot send any messages. The chatbot is locked by admin.'
                  : 'Users can access the AI chatbot normally.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleLock}
            disabled={isLoading || !stats}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md disabled:opacity-50 ${
              stats?.isLocked
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
            }`}
          >
            {stats?.isLocked ? '🔓 Unlock AI' : '🔒 Lock AI'}
          </button>
        </div>
      </div>

      {/* Credit Management */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-900 dark:text-white">Credit Management</h3>
        </div>

        {/* Quick Add Buttons */}
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">Quick Add Credits</p>
          <div className="flex flex-wrap gap-2">
            {[100, 500, 1000, 5000, 10000].map(amt => (
              <button
                key={amt}
                onClick={() => handleAddCredits(amt)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/20 transition-all disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />+{amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Reset to 10,000 */}
        <button
          onClick={() => sendAction('setCredits', 10000)}
          disabled={isLoading}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all disabled:opacity-50"
        >
          🔄 Reset to 10,000 Credits
        </button>

        {/* Custom Credit Input */}
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Set Exact Amount</p>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              placeholder="e.g. 250"
              value={customCredits}
              onChange={e => setCustomCredits(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <button
              onClick={handleSetCredits}
              disabled={isLoading || !customCredits}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all disabled:opacity-50"
            >
              Set
            </button>
          </div>
        </div>
      </div>

      {/* Rate Limit Reset */}
      {stats?.isRateLimited && (
        <div className="p-5 rounded-2xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-orange-700 dark:text-orange-400">User is currently rate-limited</p>
            <p className="text-xs text-orange-600 dark:text-orange-500">Time remaining: {stats.rateLimitRemainingMinutes} minutes</p>
          </div>
          <button
            onClick={handleResetRateLimit}
            disabled={isLoading}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white transition-all"
          >
            Reset Rate Limit Now
          </button>
        </div>
      )}
    </div>
  );
}
