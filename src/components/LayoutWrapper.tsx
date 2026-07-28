'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAppContext } from '../context/AppContext';
import { AddExpenseModal } from './Modals/AddExpenseModal';
import { NotificationDrawer } from './Notifications/NotificationDrawer';
import { saveNotificationsToStorage } from '../lib/storage';
import InstallPrompt from './InstallPrompt';
import NotificationPermissionPrompt from './NotificationPermissionPrompt';

export const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const { expenses, notifications, setNotifications } = useAppContext();

  if (pathname === '/x7k9mq2n') {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">{children}</div>;
  }

  const handleExportCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['ID', 'Title', 'Amount', 'Category', 'Date', 'Payment Method', 'Notes', 'Recurring'];
    const rows = expenses.map(e => [
      e.id,
      `"${e.title.replace(/"/g, '""')}"`,
      e.amount,
      `"${e.category}"`,
      e.date,
      `"${e.paymentMethod}"`,
      `"${e.notes || ''}"`,
      e.isRecurring
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Desktop & Mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static transition-transform duration-300 ease-in-out`}>
        <Sidebar onMobileClose={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          onOpenAddModal={() => setIsAddModalOpen(true)}
          notifications={notifications}
          onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
          onExportData={handleExportCSV}
          hasData={expenses.length > 0}
          toggleMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className={`flex-1 overflow-y-auto ${pathname === '/ai' ? 'p-0' : 'p-4 sm:p-6 lg:p-8'}`}>
          {children}
        </main>
      </div>

      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={useAppContext().categories}
        onAddExpense={useAppContext().handleAddExpense}
      />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onClearAll={() => {
          setNotifications([]);
          saveNotificationsToStorage([]);
        }}
        onMarkAllRead={() => {
          const updated = notifications.map(n => ({ ...n, read: true }));
          setNotifications(updated);
          saveNotificationsToStorage(updated);
        }}
      />
      <InstallPrompt />
      <NotificationPermissionPrompt />
    </div>
  );
};
