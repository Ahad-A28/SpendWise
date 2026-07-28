'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Expense, CategoryBudget, NotificationItem, Goal } from '../lib/types';
import { loadNotificationsFromStorage, saveNotificationsToStorage, getSampleInitialExpenses } from '../lib/storage';
import { addInAppNotification } from '../lib/notifications';
import { useAuth } from './AuthContext';

interface AppContextType {
  expenses: Expense[];
  budgets: CategoryBudget[];
  categories: Record<string, { color: string; bg: string; icon: string }>;
  notifications: NotificationItem[];
  isMounted: boolean;
  isOffline: boolean;
  handleAddExpense: (newExpenseData: Omit<Expense, 'id'>) => Promise<void>;
  handleDeleteExpense: (id: string) => Promise<void>;
  handleSaveBudgets: (newBudgets: CategoryBudget[]) => Promise<void>;
  handleSaveCategories: (newCats: Record<string, { color: string; bg: string; icon: string }>) => Promise<void>;
  handleLoadSampleData: () => Promise<void>;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  goals: Goal[];
  handleAddGoal: (newGoalData: Omit<Goal, 'id' | 'currentAmount' | 'createdAt'>) => Promise<void>;
  handleDeleteGoal: (id: string) => Promise<void>;
  handleContributeToGoal: (id: string, amount: number) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [categories, setCategories] = useState<Record<string, { color: string; bg: string; icon: string }>>({});
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const { token, user, isLoading } = useAuth();

  useEffect(() => {
    setIsMounted(true);
    const fetchData = async () => {
      if (isLoading || !user || !token) return;
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [expRes, budgRes, catRes, goalRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")}/api/expenses`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")}/api/budgets`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")}/api/categories`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")}/api/goals`, { headers })
        ]);
        
        if (expRes.ok) setExpenses(await expRes.json());
        if (budgRes.ok) setBudgets(await budgRes.json());
        if (catRes.ok) setCategories(await catRes.json());
        if (goalRes.ok) setGoals(await goalRes.json());
        
        setNotifications(loadNotificationsFromStorage());
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, [isLoading, user, token]);

  const queueRequest = (url: string, method: string, body?: any) => {
    const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    queue.push({ url, method, body });
    localStorage.setItem('offline_queue', JSON.stringify(queue));
  };

  const processOfflineQueue = async () => {
    const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    if (queue.length === 0) return;

    try {
      if (!token) return;
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

      for (const req of queue) {
        await fetch(req.url, {
          method: req.method,
          headers,
          body: req.body ? JSON.stringify(req.body) : undefined
        });
      }

      localStorage.removeItem('offline_queue');
      addInAppNotification('Online Mode', 'Internet restored. Offline requests synced successfully.', 'streak', true);
      setNotifications(loadNotificationsFromStorage());

      // Reload expenses after sync
      const expRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")}/api/expenses`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (expRes.ok) setExpenses(await expRes.json());
      
    } catch (err) {
      console.error('Error processing queue:', err);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      processOfflineQueue();
    };
    const handleOffline = () => {
      setIsOffline(true);
      addInAppNotification('Offline Mode', 'You are currently offline. Requests will be queued.', 'streak', false);
      setNotifications(loadNotificationsFromStorage());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleAddExpense = async (newExpenseData: Omit<Expense, 'id'>) => {
    try {
      const isOnline = navigator.onLine;
      const currentToken = token;
      if (isOffline || !isOnline) {
      const tempId = `temp-${Date.now()}`;
      const optimisticExpense = { ...newExpenseData, id: tempId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as unknown as Expense;
      const updated = [optimisticExpense, ...expenses];
      setExpenses(updated);
      queueRequest(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")}/api/expenses`, 'POST', newExpenseData);
      
      const categoryBudget = budgets.find(b => b.category === optimisticExpense.category);
      if (categoryBudget) {
        const now = new Date();
        const currentMonthSpent = updated
          .filter(
            e =>
              e.category === optimisticExpense.category &&
              new Date(e.date).getMonth() === now.getMonth() &&
              new Date(e.date).getFullYear() === now.getFullYear()
          )
          .reduce((sum, e) => sum + e.amount, 0);

        if (currentMonthSpent > categoryBudget.allocated) {
          addInAppNotification(
            `⚠️ Budget Cap Exceeded in ${optimisticExpense.category}`,
            `Spent ₹${currentMonthSpent} out of your ₹${categoryBudget.allocated} allocated budget limit.`,
            'budget',
            true
          );
          setNotifications(loadNotificationsFromStorage());
        }
      }

      // Add Goal Reminder Notification
      const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount && new Date(g.deadline) > new Date());
      if (activeGoals.length > 0) {
        const nearestGoal = activeGoals.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];
        addInAppNotification(
          `${nearestGoal.icon} Save for your Goal!`,
          `Don't forget to save for "${nearestGoal.title}"! You need ₹${nearestGoal.targetAmount - nearestGoal.currentAmount} before ${new Date(nearestGoal.deadline).toLocaleDateString()}.`,
          'insight',
          false
        );
        setNotifications(loadNotificationsFromStorage());
      }
      return;
    }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
        body: JSON.stringify(newExpenseData)
      });
      if (res.ok) {
        const created = await res.json();
        const updated = [created, ...expenses];
        setExpenses(updated);

        const categoryBudget = budgets.find(b => b.category === created.category);
        if (categoryBudget) {
          const now = new Date();
          const currentMonthSpent = updated
            .filter(
              e =>
                e.category === created.category &&
                new Date(e.date).getMonth() === now.getMonth() &&
                new Date(e.date).getFullYear() === now.getFullYear()
            )
            .reduce((sum, e) => sum + e.amount, 0);

          if (currentMonthSpent > categoryBudget.allocated) {
            addInAppNotification(
              `⚠️ Budget Cap Exceeded in ${created.category}`,
              `Spent ₹${currentMonthSpent} out of your ₹${categoryBudget.allocated} allocated budget limit.`,
              'budget',
              true
            );
            setNotifications(loadNotificationsFromStorage());
          }
        }

        // Add Goal Reminder Notification
        const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount && new Date(g.deadline) > new Date());
        if (activeGoals.length > 0) {
          const nearestGoal = activeGoals.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];
          addInAppNotification(
            `${nearestGoal.icon} Save for your Goal!`,
            `Don't forget to save for "${nearestGoal.title}"! You need ₹${nearestGoal.targetAmount - nearestGoal.currentAmount} before ${new Date(nearestGoal.deadline).toLocaleDateString()}.`,
            'insight',
            false
          );
          setNotifications(loadNotificationsFromStorage());
        }
      }
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const isOnline = navigator.onLine;
      const currentToken = token;
      if (isOffline || !isOnline) {
      setExpenses(expenses.filter(e => e.id !== id));
      queueRequest(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")}/api/expenses/${id}`, 'DELETE');
      return;
    }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")}/api/expenses/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.ok) {
        setExpenses(expenses.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const handleSaveBudgets = async (newBudgets: CategoryBudget[]) => {
    try {
      const isOnline = navigator.onLine;
      const currentToken = token;
      if (isOffline || !isOnline) {
      setBudgets(newBudgets);
      queueRequest(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")}/api/budgets`, 'POST', newBudgets);
      addInAppNotification('Budgets Updated (Offline)', 'Category spending caps saved locally and queued.', 'insight', false);
      setNotifications(loadNotificationsFromStorage());
      return;
    }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")}/api/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
        body: JSON.stringify(newBudgets)
      });
      if (res.ok) {
        setBudgets(newBudgets);
        addInAppNotification('Budgets Updated', 'Category spending caps saved successfully.', 'insight', false);
        setNotifications(loadNotificationsFromStorage());
      }
    } catch (err) {
      console.error('Error saving budgets:', err);
    }
  };

  const handleSaveCategories = async (newCats: Record<string, { color: string; bg: string; icon: string }>) => {
    try {
      const isOnline = navigator.onLine;
      const currentToken = token;
      if (isOffline || !isOnline) {
      setCategories(newCats);
      queueRequest(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")}/api/categories`, 'POST', newCats);
      return;
    }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
        body: JSON.stringify(newCats)
      });
      if (res.ok) {
        setCategories(newCats);
      } else {
        const errorText = await res.text();
        console.error('Failed to save categories on backend:', errorText);
        alert('Failed to save category to database: ' + errorText);
      }
    } catch (err) {
      console.error('Error saving categories:', err);
      alert('Network error saving category.');
    }
  };

  const handleLoadSampleData = async () => {
    try {
      const currentToken = token;
      const samples = getSampleInitialExpenses();
      for (const sample of samples) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")}/api/expenses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
          body: JSON.stringify({ ...sample, id: undefined })
        });
      }
      
      // Reload expenses
      const expRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")}/api/expenses`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (expRes.ok) setExpenses(await expRes.json());
      
      addInAppNotification('Sample Data Loaded', 'Pre-loaded transactions for testing.', 'streak', true);
      setNotifications(loadNotificationsFromStorage());
    } catch (err) {
      console.error('Error loading sample data:', err);
    }
  };

  const handleAddGoal = async (newGoalData: Omit<Goal, 'id' | 'currentAmount' | 'createdAt'>) => {
    try {
      const currentToken = token;
      const isOnline = navigator.onLine;
      if (isOffline || !isOnline) {
      const tempId = `temp-${Date.now()}`;
      const optimisticGoal = { ...newGoalData, id: tempId, currentAmount: 0, createdAt: new Date().toISOString() } as Goal;
      setGoals(prev => [optimisticGoal, ...prev]);
      queueRequest(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")}/api/goals`, 'POST', { ...newGoalData, currentAmount: 0 });
      addInAppNotification('Goal Added (Offline)', `Successfully added ${optimisticGoal.title} locally.`, 'streak', true);
      return;
    }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")}/api/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
        body: JSON.stringify({ ...newGoalData, currentAmount: 0 })
      });
      if (res.ok) {
        const added = await res.json();
        setGoals(prev => [added, ...prev]);
        addInAppNotification('Goal Added', `Successfully added ${added.title}.`, 'streak', true);
      }
    } catch (err) {
      console.error('Failed to add goal:', err);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      const currentToken = token;
      const isOnline = navigator.onLine;
      if (isOffline || !isOnline) {
      setGoals(prev => prev.filter(g => g.id !== id));
      queueRequest(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")}/api/goals/${id}`, 'DELETE');
      return;
    }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")}/api/goals/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.ok) {
        setGoals(prev => prev.filter(g => g.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const handleContributeToGoal = async (id: string, amount: number) => {
    try {
      const currentToken = token;
      const isOnline = navigator.onLine;
      if (isOffline || !isOnline) {
        setGoals(prev => prev.map(g => (g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g)));
        queueRequest(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")}/api/goals/${id}/contribute`, 'POST', { amount });
        addInAppNotification('Contribution Queued', `Contribution of ₹${amount} queued offline.`, 'streak', true);
        return;
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000")}/api/goals/${id}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
        body: JSON.stringify({ amount })
      });
      if (res.ok) {
        const updated = await res.json();
        setGoals(prev => prev.map(g => (g.id === id ? updated : g)));
        
        if (updated.currentAmount >= updated.targetAmount) {
          addInAppNotification('Goal Reached! 🎉', `Congratulations, you achieved your goal: ${updated.title}!`, 'streak', true);
        } else {
          addInAppNotification('Contribution Added', `Added ₹${amount} to ${updated.title}.`, 'streak', true);
        }
      }
    } catch (err) {
      console.error('Failed to contribute to goal:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        expenses,
        budgets,
        categories,
        notifications,
        isMounted,
        isOffline,
        handleAddExpense,
        handleDeleteExpense,
        handleSaveBudgets,
        handleSaveCategories,
        handleLoadSampleData,
        setNotifications,
        goals,
        handleAddGoal,
        handleDeleteGoal,
        handleContributeToGoal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
