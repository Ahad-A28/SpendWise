'use client';

import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../../lib/types';
import { Bell, BellOff, X, Check, Trash2, AlertTriangle, Sparkles, Award, CheckCircle2 } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
}) => {
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | null>(null);
  const [permStatus, setPermStatus] = useState<'idle' | 'granted' | 'denied'>('idle');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, [isOpen]);

  const handleAllow = async () => {
    const result = await Notification.requestPermission();
    setNotifPermission(result);
    if (result === 'granted') {
      setPermStatus('granted');
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification('SpendWise AI 🎉', {
          body: "You'll now get smart spending alerts!",
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: 'welcome',
        });
      }
    } else {
      setPermStatus('denied');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 dark:bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border-l border-slate-200 dark:border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] h-full flex flex-col transition-transform duration-300 ease-out translate-x-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-900/50 dark:to-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl border border-indigo-200 dark:border-indigo-500/30">
              <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 bg-slate-50/80 dark:bg-slate-900/40 border-b border-slate-200 dark:border-white/5 flex items-center justify-between text-sm">
          <button
            onClick={onMarkAllRead}
            className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center gap-1.5 font-medium transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-500/10 px-3 py-1.5 rounded-lg"
          >
            <Check className="w-4 h-4" /> Mark all read
          </button>
          <button
            onClick={onClearAll}
            className="text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1.5 font-medium transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10 px-3 py-1.5 rounded-lg"
          >
            <Trash2 className="w-4 h-4" /> Clear all
          </button>
        </div>

        {/* Notification Permission Banner */}
        {notifPermission === 'default' && (
          <div className="mx-1 mb-1 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 overflow-hidden">
            {permStatus === 'granted' ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Notifications enabled! 🎉</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">You'll get smart budget alerts</p>
                </div>
              </div>
            ) : permStatus === 'denied' ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <BellOff className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Notifications blocked</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enable from your browser settings</p>
                </div>
              </div>
            ) : (
              <div className="px-4 py-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">Turn on Notifications</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Get budget alerts &amp; spending reminders
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAllow}
                  className="mt-3 w-full py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                >
                  🔔 Allow Notifications
                </button>
              </div>
            )}
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <Bell className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">No new notifications</p>
            </div>
          ) : (
            notifications.map(item => {
              return (
                <div
                  key={item.id}
                  className={`group relative p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] cursor-default ${
                    item.read
                      ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      : 'bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900 border-indigo-200 dark:border-indigo-500/30 text-slate-900 dark:text-white shadow-md shadow-indigo-100 dark:shadow-lg dark:shadow-indigo-500/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 p-2 rounded-full ${item.read ? 'bg-slate-200/50 dark:bg-slate-800/50' : 'bg-indigo-100 dark:bg-indigo-500/20'}`}>
                      {item.type === 'budget' ? (
                        <AlertTriangle className={`w-4 h-4 ${item.read ? 'text-slate-400 dark:text-slate-500' : 'text-amber-500 dark:text-amber-400'}`} />
                      ) : item.type === 'streak' ? (
                        <Award className={`w-4 h-4 ${item.read ? 'text-slate-400 dark:text-slate-500' : 'text-emerald-500 dark:text-emerald-400'}`} />
                      ) : (
                        <Sparkles className={`w-4 h-4 ${item.read ? 'text-slate-400 dark:text-slate-500' : 'text-indigo-600 dark:text-indigo-400'}`} />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className={`font-semibold text-sm ${item.read ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                          {item.title}
                        </div>
                        <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${item.read ? 'text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                        {item.message}
                      </p>
                    </div>
                  </div>
                  {!item.read && (
                    <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)] dark:shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

