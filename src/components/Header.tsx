'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Plus, Database, Menu, Sun, Moon } from 'lucide-react';
import { NotificationItem } from '../lib/types';
import { useTheme } from 'next-themes';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  onOpenAddModal: () => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onExportData: () => void;
  onLoadSampleData?: () => void;
  hasData: boolean;
  toggleMobileMenu?: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/': 'Overview',
  '/transactions': 'Transactions',
  '/budgeting': 'Budgeting',
  '/goals': 'Goals',
  '/analysis': 'Analysis',
  '/ai': 'AI Assistant',
};

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  notifications,
  onOpenNotifications,
  onLoadSampleData,
  hasData,
  toggleMobileMenu,
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();
  const pageTitle = PAGE_TITLES[pathname] ?? 'SpendWise';
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="w-full px-4 sm:px-6 flex items-center h-14">

        {/* ── Mobile hamburger ── */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors -ml-1"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* ── Desktop: page title ── */}
        <h1 className="hidden md:block text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          {pageTitle}
        </h1>

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Right action row ── */}
        <div className="flex items-center gap-2">

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex w-9 h-9 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {/* Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-[7px] h-[7px] rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
            )}
          </button>

          {/* Demo data — desktop only */}
          {!hasData && (
            <button
              onClick={onLoadSampleData}
              title="Load demo data"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Database className="w-3.5 h-3.5" />
              Demo
            </button>
          )}

          {/* Add Expense — circle on mobile */}
          <button
            onClick={onOpenAddModal}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/30 active:scale-90 transition-all"
            title="Add Expense"
          >
            <Plus className="w-[18px] h-[18px]" />
          </button>

          {/* Add Expense — pill on desktop */}
          <button
            onClick={onOpenAddModal}
            className="hidden md:flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/25 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Expense
          </button>

          {/* Avatar — same visual height */}
          <div className="relative w-9 h-9 flex items-center justify-center flex-shrink-0">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full h-full rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
              )}
            </button>

            {showDropdown && (
              <div className="absolute top-12 right-0 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );


};
