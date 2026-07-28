export type CategoryType = string;

export interface CategoryMeta {
  color: string;
  bg: string;
  icon: string;
}

export type PaymentMethod = 'Credit Card' | 'Debit Card' | 'Cash' | 'Bank Transfer' | 'UPI / Digital';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: CategoryType;
  date: string; // ISO format YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  isRecurring?: boolean;
  tags?: string[];
}

export interface CategoryBudget {
  id: string;
  category: CategoryType;
  allocated: number;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  autoSaveAmount?: number;
  deadline: string;
  color: string;
  icon: string;
  createdAt?: string;
}

export interface SpendingInsight {
  id: string;
  type: 'alert' | 'warning' | 'tip' | 'praise';
  category?: CategoryType;
  title: string;
  description: string;
  potentialSavings: number;
  actionableStep: string;
  impactScore: 'High' | 'Medium' | 'Low';
}

export interface MonthComparison {
  category: CategoryType;
  currentMonthSpent: number;
  previousMonthSpent: number;
  diffAmount: number;
  percentageChange: number; // positive = spent more, negative = saved money
  isSpike: boolean;
}

export interface YesterdayComparison {
  todaySpent: number;
  yesterdaySpent: number;
  diffAmount: number;
  percentageChange: number; // negative = improved/saved money
  isImproved: boolean;
  streakDays: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'budget' | 'insight' | 'streak' | 'reminder';
  read: boolean;
}
