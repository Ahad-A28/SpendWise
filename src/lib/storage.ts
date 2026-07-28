import { Expense, CategoryBudget, NotificationItem, CategoryType } from './types';

const STORAGE_KEYS = {
  EXPENSES: 'expense_tracker_items_v2',
  BUDGETS: 'expense_tracker_budgets_v2',
  NOTIFICATIONS: 'expense_tracker_notifications_v2',
  CATEGORIES: 'expense_tracker_categories_v2',
};

export const DEFAULT_CATEGORY_DETAILS: Record<string, { color: string; bg: string; icon: string }> = {
  'Food & Dining': { color: '#F59E0B', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: 'Utensils' },
  'Housing & Rent': { color: '#6366F1', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: 'Home' },
  'Shopping & Goods': { color: '#EC4899', bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20', icon: 'ShoppingBag' },
  'Entertainment & Fun': { color: '#8B5CF6', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: 'Film' },
  'Transportation': { color: '#3B82F6', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: 'Car' },
  'Utilities & Bills': { color: '#10B981', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: 'Zap' },
  'Subscriptions': { color: '#EF4444', bg: 'bg-red-500/10 text-red-400 border-red-500/20', icon: 'Tv' },
  'Healthcare & Fitness': { color: '#14B8A6', bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20', icon: 'Activity' },
  'Personal Care': { color: '#F43F5E', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: 'Sparkles' },
  'Miscellaneous': { color: '#6B7280', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: 'Grid' },
};

export const DEFAULT_BUDGETS: CategoryBudget[] = [
  { category: 'Food & Dining', allocated: 10000 },
  { category: 'Housing & Rent', allocated: 25000 },
  { category: 'Shopping & Goods', allocated: 8000 },
  { category: 'Entertainment & Fun', allocated: 5000 },
  { category: 'Transportation', allocated: 4000 },
  { category: 'Utilities & Bills', allocated: 6000 },
  { category: 'Subscriptions', allocated: 2000 },
  { category: 'Healthcare & Fitness', allocated: 5000 },
  { category: 'Personal Care', allocated: 3000 },
  { category: 'Miscellaneous', allocated: 4000 },
] as any as CategoryBudget[];

export function getTodayStr(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

// Optional sample data generator if user wants to seed demo data
export function getSampleInitialExpenses(): Expense[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const formatDay = (m: number, d: number) => {
    const targetDate = new Date(year, m, d);
    return `${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())}`;
  };

  const prevMonthIdx = month === 0 ? 11 : month - 1;

  return [
    { id: 'p1', title: 'Monthly Rent', amount: 25000, category: 'Housing & Rent', date: formatDay(prevMonthIdx, 1), paymentMethod: 'Bank Transfer' },
    { id: 'p2', title: 'Electric & Power Bill', amount: 2500, category: 'Utilities & Bills', date: formatDay(prevMonthIdx, 5), paymentMethod: 'Debit Card' },
    { id: 'p3', title: 'Fancy Steakhouse Dinner', amount: 3500, category: 'Food & Dining', date: formatDay(prevMonthIdx, 8), paymentMethod: 'Credit Card' },
    { id: 'p4', title: 'Online Shopping Spree', amount: 5000, category: 'Shopping & Goods', date: formatDay(prevMonthIdx, 12), paymentMethod: 'Credit Card' },
    { id: 'p5', title: 'Netflix Premium', amount: 650, category: 'Subscriptions', date: formatDay(prevMonthIdx, 15), paymentMethod: 'Credit Card', isRecurring: true },
    { id: 'c1', title: 'Monthly Rent', amount: 25000, category: 'Housing & Rent', date: formatDay(month, 1), paymentMethod: 'Bank Transfer' },
    { id: 'c2', title: 'Groceries Store', amount: 2000, category: 'Food & Dining', date: formatDay(month, 5), paymentMethod: 'Debit Card' },
    { id: 'c3', title: 'Uber Ride', amount: 450, category: 'Transportation', date: formatDay(month, 8), paymentMethod: 'UPI / Digital' },
    { id: 'y1', title: 'Restaurant Dinner', amount: 1500, category: 'Food & Dining', date: getYesterdayStr(), paymentMethod: 'Credit Card' },
    { id: 't1', title: 'Morning Coffee & Bagel', amount: 250, category: 'Food & Dining', date: getTodayStr(), paymentMethod: 'UPI / Digital' },
  ];
}

export function loadExpensesFromStorage(): Expense[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) return []; // Clean empty state by default!
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveExpensesToStorage(expenses: Expense[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Failed to save expenses', e);
  }
}

export function loadBudgetsFromStorage(): CategoryBudget[] {
  if (typeof window === 'undefined') return DEFAULT_BUDGETS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (!raw) return DEFAULT_BUDGETS;
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_BUDGETS;
  }
}

export function saveBudgetsToStorage(budgets: CategoryBudget[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  } catch (e) {
    console.error('Failed to save budgets', e);
  }
}

export function loadNotificationsFromStorage(): NotificationItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveNotificationsToStorage(notifications: NotificationItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  } catch (e) {
    console.error('Failed to save notifications', e);
  }
}

export function loadCategoriesFromStorage(): Record<string, { color: string; bg: string; icon: string }> {
  if (typeof window === 'undefined') return DEFAULT_CATEGORY_DETAILS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) return DEFAULT_CATEGORY_DETAILS;
    return { ...DEFAULT_CATEGORY_DETAILS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_CATEGORY_DETAILS;
  }
}

export function saveCategoriesToStorage(categories: Record<string, { color: string; bg: string; icon: string }>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories', e);
  }
}
