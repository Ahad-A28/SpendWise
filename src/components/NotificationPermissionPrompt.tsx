'use client';

import React, { useEffect, useState } from 'react';
import { Bell, BellOff, X, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'sw_notif_prompt_dismissed';

export default function NotificationPermissionPrompt() {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<'idle' | 'granted' | 'denied'>('idle');

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Already granted or denied — never show again
    if (Notification.permission !== 'default') return;

    // User already dismissed this prompt
    if (localStorage.getItem(STORAGE_KEY) === '1') return;

    // Show after a short delay so it doesn't fight with page load
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleAllow = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setStatus('granted');
        // Register with service worker if available
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready;
          // Trigger a test notification
          reg.showNotification('SpendWise AI 🎉', {
            body: "You'll now get smart spending alerts and budget reminders!",
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: 'welcome',
          });
        }
        setTimeout(() => setShow(false), 2500);
      } else {
        setStatus('denied');
        localStorage.setItem(STORAGE_KEY, '1');
        setTimeout(() => setShow(false), 2000);
      }
    } catch {
      setShow(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-80 z-[110] animate-in slide-in-from-bottom-4 duration-300">
      <div className="relative bg-slate-900 dark:bg-slate-800 border border-slate-700 dark:border-slate-600 rounded-2xl shadow-2xl overflow-hidden">

        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 p-1 rounded-full hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-4 pr-8">
          {status === 'granted' ? (
            /* Success state */
            <div className="flex items-center gap-3 py-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Notifications On! 🎉</p>
                <p className="text-slate-400 text-xs mt-0.5">You'll get smart budget alerts</p>
              </div>
            </div>
          ) : status === 'denied' ? (
            /* Denied state */
            <div className="flex items-center gap-3 py-1">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                <BellOff className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Notifications blocked</p>
                <p className="text-slate-400 text-xs mt-0.5">You can enable them from browser settings</p>
              </div>
            </div>
          ) : (
            /* Default prompt */
            <>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm leading-tight">Turn on Notifications</h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Get alerts when you're near your budget limit, and daily spending reminders.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleDismiss}
                  className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl border border-slate-700 dark:border-slate-600 transition-colors"
                >
                  Not now
                </button>
                <button
                  onClick={handleAllow}
                  className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
                >
                  🔔 Allow
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
