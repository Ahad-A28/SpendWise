import { Expense, CategoryBudget, SpendingInsight, MonthComparison, YesterdayComparison, CategoryType } from './types';
import { getTodayStr, getYesterdayStr } from './storage';

export function calculateTotalSpent(expenses: Expense[]): number {
  return expenses.reduce((acc, curr) => acc + curr.amount, 0);
}

export function filterExpensesByMonth(expenses: Expense[], targetYear: number, targetMonthIdx: number): Expense[] {
  return expenses.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === targetYear && d.getMonth() === targetMonthIdx;
  });
}

export function calculateYesterdayVsToday(expenses: Expense[]): YesterdayComparison {
  const today = getTodayStr();
  const yesterday = getYesterdayStr();

  const todayExpenses = expenses.filter(e => e.date === today);
  const yesterdayExpenses = expenses.filter(e => e.date === yesterday);

  const todaySpent = todayExpenses.reduce((sum, item) => sum + item.amount, 0);
  const yesterdaySpent = yesterdayExpenses.reduce((sum, item) => sum + item.amount, 0);

  const diffAmount = todaySpent - yesterdaySpent;
  let percentageChange = 0;
  if (yesterdaySpent > 0) {
    percentageChange = Number(((diffAmount / yesterdaySpent) * 100).toFixed(1));
  } else if (todaySpent > 0) {
    percentageChange = 100;
  }

  // Improvement means spending LESS today than yesterday or staying under average
  const isImproved = diffAmount <= 0;

  // Simple streak calculation based on recent days below daily target (₹750/day)
  let streakDays = 0;
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    const daySpent = expenses
      .filter(e => e.date === dateStr)
      .reduce((s, e) => s + e.amount, 0);
    
    if (daySpent <= 75) {
      streakDays++;
    } else {
      break;
    }
  }

  return {
    todaySpent,
    yesterdaySpent,
    diffAmount,
    percentageChange,
    isImproved,
    streakDays: Math.max(streakDays, 1),
  };
}

export function calculateMonthOverMonthComparison(expenses: Expense[]): MonthComparison[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth();

  const currentMonthExpenses = filterExpensesByMonth(expenses, currentYear, currentMonth);
  const prevMonthExpenses = filterExpensesByMonth(expenses, prevYear, prevMonth);

  const categories: CategoryType[] = [
    'Food & Dining',
    'Housing & Rent',
    'Shopping & Goods',
    'Entertainment & Fun',
    'Transportation',
    'Utilities & Bills',
    'Subscriptions',
    'Healthcare & Fitness',
    'Personal Care',
    'Miscellaneous',
  ];

  return categories.map(category => {
    const currentMonthSpent = currentMonthExpenses
      .filter(e => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);

    const previousMonthSpent = prevMonthExpenses
      .filter(e => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);

    const diffAmount = currentMonthSpent - previousMonthSpent;
    let percentageChange = 0;
    if (previousMonthSpent > 0) {
      percentageChange = Number(((diffAmount / previousMonthSpent) * 100).toFixed(1));
    } else if (currentMonthSpent > 0) {
      percentageChange = 100;
    }

    const isSpike = percentageChange > 15 && currentMonthSpent > 50;

    return {
      category,
      currentMonthSpent,
      previousMonthSpent,
      diffAmount,
      percentageChange,
      isSpike,
    };
  });
}

export function generateSmartReductionInsights(
  expenses: Expense[],
  budgets: CategoryBudget[]
): SpendingInsight[] {
  const monthComparisons = calculateMonthOverMonthComparison(expenses);
  const insights: SpendingInsight[] = [];

  const now = new Date();
  const currentMonthExpenses = filterExpensesByMonth(expenses, now.getFullYear(), now.getMonth());
  const prevMonthExpenses = filterExpensesByMonth(
    expenses,
    new Date(now.getFullYear(), now.getMonth() - 1, 1).getFullYear(),
    new Date(now.getFullYear(), now.getMonth() - 1, 1).getMonth()
  );

  // 1. Food & Dining Takeout / Restaurant Advice
  const foodComparison = monthComparisons.find(m => m.category === 'Food & Dining');
  const foodSpentPrev = foodComparison ? foodComparison.previousMonthSpent : 0;
  const foodSpentCurr = foodComparison ? foodComparison.currentMonthSpent : 0;

  if (foodSpentPrev > 250 || foodSpentCurr > 200) {
    const potentialSaving = Math.round((foodSpentPrev > 0 ? foodSpentPrev : foodSpentCurr) * 0.35);
    insights.push({
      id: 'ins-food',
      type: foodComparison?.isSpike ? 'alert' : 'tip',
      category: 'Food & Dining',
      title: 'High Food & Takeout Expenses',
      description: `You spent ₹${foodSpentPrev || foodSpentCurr} on Food & Dining. Dining out and food deliveries account for a large portion of discretionary spending.`,
      potentialSavings: potentialSaving,
      actionableStep: `Meal prep on Sundays and limit takeout to 2x per week. Target saving: ~₹${potentialSaving}/month.`,
      impactScore: 'High',
    });
  }

  // 2. Subscriptions Audit Tip
  const subExpenses = expenses.filter(e => e.category === 'Subscriptions' || e.isRecurring);
  const subTotal = subExpenses.reduce((sum, e) => sum + e.amount, 0);
  if (subTotal > 30) {
    insights.push({
      id: 'ins-subs',
      type: 'warning',
      category: 'Subscriptions',
      title: 'Recurring Subscription Cleanup',
      description: `You have multiple recurring subscriptions totaling ₹${subTotal}/month.`,
      potentialSavings: Math.round(subTotal * 0.4),
      actionableStep: `Audit active services (Netflix, Spotify, Cloud Storage). Pause unused subscriptions to save ~₹${Math.round(subTotal * 0.4)}/month.`,
      impactScore: 'Medium',
    });
  }

  // 3. Category Budget Overrun Alerts
  budgets.forEach(b => {
    const categorySpent = currentMonthExpenses
      .filter(e => e.category === b.category)
      .reduce((sum, e) => sum + e.amount, 0);

    if (categorySpent >= b.allocated * 0.85) {
      const overBy = Math.max(0, categorySpent - b.allocated);
      insights.push({
        id: `ins-budget-${b.category}`,
        type: categorySpent > b.allocated ? 'alert' : 'warning',
        category: b.category,
        title: `${b.category} ${categorySpent > b.allocated ? 'Exceeded Budget' : 'Near Limit'}`,
        description: `Spent ₹${categorySpent} out of your ₹${b.allocated} allocated monthly budget (${Math.round((categorySpent / b.allocated) * 100)}%).`,
        potentialSavings: Math.round(b.allocated * 0.15),
        actionableStep: `Cap remaining daily spending in ${b.category} to avoid further overruns.`,
        impactScore: 'High',
      });
    }
  });

  // 4. Yesterday vs Today Praise or Caution
  const yvt = calculateYesterdayVsToday(expenses);
  if (yvt.isImproved && yvt.yesterdaySpent > 0) {
    insights.push({
      id: 'ins-yvt-praise',
      type: 'praise',
      title: 'Great Improvement Today! 🎉',
      description: `You spent ${Math.abs(yvt.percentageChange)}% less today (₹${yvt.todaySpent}) compared to yesterday (₹${yvt.yesterdaySpent}).`,
      potentialSavings: Math.max(0, yvt.diffAmount * -1),
      actionableStep: `Keep this momentum to boost your ${yvt.streakDays}-day spending streak!`,
      impactScore: 'Low',
    });
  }

  return insights;
}
