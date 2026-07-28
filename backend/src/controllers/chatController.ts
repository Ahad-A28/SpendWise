import type { Request, Response } from 'express';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import AppSetting from '../models/AppSetting.js';
import Expense from '../models/Expense.js';
import Goal from '../models/Goal.js';
import Budget from '../models/Budget.js';
import CreditLog from '../models/CreditLog.js';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

interface CreditConfig {
  credits: number;
  requestCount: number;
  windowStart: number;
  blockedUntil: number | null;
  isLocked?: boolean;
  chatCost?: number;
  agentCost?: number;
  fileCost?: number;
}

const PRESET_COLORS = [
  { color: '#6366F1', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: 'Tag' },
  { color: '#EC4899', bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20', icon: 'Tag' },
  { color: '#10B981', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: 'Tag' },
  { color: '#F59E0B', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: 'Tag' },
  { color: '#3B82F6', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: 'Tag' },
  { color: '#8B5CF6', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: 'Tag' },
];

const ensureCategoryExists = async (categoryName: string, userId: string) => {
  let catSetting = await AppSetting.findOne({ key: 'categories', userId });
  let cats = catSetting ? catSetting.value || {} : {};
  if (!cats[categoryName]) {
    const randomPreset = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
    cats[categoryName] = randomPreset;
    await AppSetting.findOneAndUpdate(
      { key: 'categories', userId },
      { key: 'categories', value: cats, userId },
      { upsert: true, new: true }
    );
  }
};

const tools = [
  {
    functionDeclarations: [
      {
        name: 'addExpense',
        description: 'Add a new expense transaction. Use when user asks to record spending or expense in English, Hindi, Hinglish, or any language.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING, description: 'Brief description of expense' },
            amount: { type: SchemaType.NUMBER, description: 'Amount spent in Indian Rupees (INR)' },
            category: { type: SchemaType.STRING, description: 'Category name' },
            paymentMethod: { type: SchemaType.STRING, description: 'Payment method e.g. UPI / Digital, Cash, Credit Card, Debit Card, Bank Transfer' }
          },
          required: ['title', 'amount', 'category']
        }
      },
      {
        name: 'addGoal',
        description: 'Create a new savings goal for the user.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING, description: 'Name of the goal e.g. Vacation, Laptop, Emergency Fund' },
            targetAmount: { type: SchemaType.NUMBER, description: 'Target amount in Indian Rupees (INR)' },
            deadline: { type: SchemaType.STRING, description: 'Deadline date in YYYY-MM-DD format if mentioned' },
            autoSaveAmount: { type: SchemaType.NUMBER, description: 'Monthly auto-save amount if specified' }
          },
          required: ['title', 'targetAmount']
        }
      },
      {
        name: 'setBudget',
        description: 'Set or update the monthly budget limit for a category in /budgeting. Directly adds to Categories and Monthly Budgets.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            category: { type: SchemaType.STRING, description: 'Name of the category e.g. Food & Dining, Gym, Books, Shopping, etc.' },
            allocated: { type: SchemaType.NUMBER, description: 'Allocated monthly budget amount in Indian Rupees (INR)' }
          },
          required: ['category', 'allocated']
        }
      },
      {
        name: 'addCategory',
        description: 'Create a new category directly in /budgeting.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            category: { type: SchemaType.STRING, description: 'Name of the new category' },
            allocated: { type: SchemaType.NUMBER, description: 'Optional initial monthly budget limit in INR' }
          },
          required: ['category']
        }
      },
      {
        name: 'bulkAddExpenses',
        description: 'Bulk add multiple expense transactions at once. Use when user uploads a file/receipt with multiple transactions.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            expenses: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  title: { type: SchemaType.STRING, description: 'Brief description' },
                  amount: { type: SchemaType.NUMBER, description: 'Amount in INR' },
                  category: { type: SchemaType.STRING, description: 'Category name' },
                  date: { type: SchemaType.STRING, description: 'Date of transaction (YYYY-MM-DD)' },
                  paymentMethod: { type: SchemaType.STRING }
                },
                required: ['title', 'amount', 'category']
              }
            }
          },
          required: ['expenses']
        }
      }
    ]
  }
];

const getOrCreateCreditConfig = async (userId: string): Promise<{ setting: any; data: CreditConfig }> => {
  let setting = await AppSetting.findOne({ key: 'aiCreditConfig', userId });
  if (!setting) {
    const initialData: CreditConfig = {
      credits: 0,
      requestCount: 0,
      windowStart: Date.now(),
      blockedUntil: null,
    };
    setting = new AppSetting({ key: 'aiCreditConfig', value: initialData, userId });
    await setting.save();
  }
  
  let data: CreditConfig = typeof setting.value === 'object' ? setting.value : {
    credits: Number(setting.value) || 0,
    requestCount: 0,
    windowStart: Date.now(),
    blockedUntil: null,
  };

  return { setting, data };
};

export const getAiCredits = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { data } = await getOrCreateCreditConfig(userId);
    
    const now = Date.now();
    let isBlocked = false;
    let timeRemainingMinutes = 0;

    if (data.blockedUntil && now < data.blockedUntil) {
      isBlocked = true;
      timeRemainingMinutes = Math.ceil((data.blockedUntil - now) / (1000 * 60));
    }

    res.json({
      credits: data.credits,
      requestCount: data.requestCount,
      isBlocked,
      isLocked: data.isLocked ?? false,
      timeRemainingMinutes,
      chatCost: data.chatCost ?? 1,
      agentCost: data.agentCost ?? 5,
      fileCost: data.fileCost ?? 10,
    });
  } catch (error) {
    console.error('Failed to fetch AI credits', error);
    res.status(500).json({ error: 'Failed to fetch credits' });
  }
};

export const generateChatResponse = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { setting, data } = await getOrCreateCreditConfig(userId);
    const now = Date.now();
    const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;

    const { message, expenses, budgets, isAgentMode, fileData } = req.body;
    let creditCost = isAgentMode ? (data.agentCost ?? 5) : (data.chatCost ?? 1);
    if (fileData) {
      creditCost = data.fileCost ?? 10;
    }

    // Check admin master lock
    if (data.isLocked) {
      return res.status(403).json({ error: 'AI Chatbot has been locked by the administrator. Please contact the developer to unlock it.', isAdminLocked: true });
    }

    if (data.blockedUntil && now < data.blockedUntil) {
      const remainingMinutes = Math.ceil((data.blockedUntil - now) / (1000 * 60));
      const hours = Math.floor(remainingMinutes / 60);
      const mins = remainingMinutes % 60;
      const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
      
      return res.status(429).json({
        error: `Rate limit reached (500 requests / 5 hours). You are temporarily blocked. Please try again in ${timeStr}.`
      });
    }

    if (data.blockedUntil && now >= data.blockedUntil) {
      data.blockedUntil = null;
      data.requestCount = 0;
      data.windowStart = now;
    }

    if (now - data.windowStart > FIVE_HOURS_MS) {
      data.windowStart = now;
      data.requestCount = 0;
    }

    if (data.credits < creditCost) {
      let costMessage = '';
      if (fileData) {
        const defaultCost = 10;
        costMessage = `Uploading a file costs ${defaultCost} credit(s)`;
        if (creditCost > defaultCost) costMessage += ` but now ${creditCost} increased due to high demand`;
        else if (creditCost < defaultCost) costMessage = `Uploading a file costs ${creditCost} credit(s)`;
      } else {
        const defaultCost = isAgentMode ? 5 : 1;
        costMessage = `${isAgentMode ? 'Agent Mode' : 'Normal Chat'} costs ${defaultCost} credit(s)`;
        if (creditCost > defaultCost) costMessage += ` but now ${creditCost} increased due to high demand`;
        else if (creditCost < defaultCost) costMessage = `${isAgentMode ? 'Agent Mode' : 'Normal Chat'} costs ${creditCost} credit(s)`;
      }

      return res.status(403).json({
        error: `Insufficient credits. ${costMessage}. (You have ${data.credits} credits).`
      });
    }

    if (data.requestCount >= 500) {
      data.blockedUntil = now + FIVE_HOURS_MS;
      setting.value = data;
      setting.markModified('value');
      await setting.save();

      return res.status(429).json({
        error: 'Rate limit reached! You have made 500 requests. Your account is temporarily paused for 5 hours to prevent abuse.'
      });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      tools: isAgentMode ? (tools as any) : undefined,
    });

    const prompt = isAgentMode
      ? `
      You are SpendWise AI, an autonomous financial AGENT. 
      You help users manage their money, track expenses, set budgets, and create savings goals/categories in /budgeting.
      You support MULTILINGUAL inputs including English, Hindi (हिंदी), and Hinglish (e.g., "aaj 500 rupaye khana pe kharch hue").
      
      IMPORTANT RULES:
      1. Always use Indian Rupees (INR / ₹) for amounts.
      2. If the user tells you about spending money, setting a budget cap, or adding a category/goal in any language (Hindi/Hinglish/English), USE THE PROVIDED TOOLS ('addExpense', 'addGoal', 'setBudget', 'addCategory', 'bulkAddExpenses') to take real action immediately!
      3. CRITICAL: If the user speaks in Hindi or Hinglish, ALWAYS respond in HINGLISH (using English/Roman letters like "Maine aapka ₹500 ka expense add kar diya hai!"). NEVER use Devanagari Hindi script.
      4. Keep your conversational response concise, clear, and formatted nicely in Markdown.
      5. If a user uploads a transaction file, bank statement, or receipt, analyze it and extract all expenses. Use the 'bulkAddExpenses' tool to add them all at once. Extract the exact date for each transaction if available. ONLY extract Debits or negative amounts (-) as expenses. IGNORE any Credits or positive amounts (+) because the app only tracks expenses, not incomes.
      
      User's current expense data (JSON format):
      ${JSON.stringify(expenses?.slice(0, 30) || [])}
      
      User's budget caps (JSON format):
      ${JSON.stringify(budgets || [])}
      
      User's Account & Credit Info:
      Current AI Credits: ${data.credits} credits remaining
      Cost per Normal Chat: ${data.chatCost ?? 1} credit(s)
      Cost per Agent Action: ${data.agentCost ?? 5} credit(s)
      Cost per File Upload: ${data.fileCost ?? 10} credit(s)
      
      User's message: "${message}"
    `
      : `
      You are SpendWise AI, a helpful personal financial assistant.
      You answer questions about the user's spending habits, budgets, and savings.
      You support English, Hindi, and Hinglish.
      
      IMPORTANT RULES:
      1. Always use Indian Rupees (INR / ₹) for amounts.
      2. You are in NORMAL CHAT MODE: Do not execute actions, just answer the user's questions clearly and concisely.
      3. If the user speaks in Hindi or Hinglish, ALWAYS respond in HINGLISH (using English/Roman letters). NEVER use Devanagari Hindi script.
      
      User's current expense data (JSON format):
      ${JSON.stringify(expenses?.slice(0, 30) || [])}
      
      User's budget caps (JSON format):
      ${JSON.stringify(budgets || [])}
      
      User's Account & Credit Info:
      Current AI Credits: ${data.credits} credits remaining
      Cost per Normal Chat: ${data.chatCost ?? 1} credit(s)
      Cost per Agent Action: ${data.agentCost ?? 5} credit(s)
      Cost per File Upload: ${data.fileCost ?? 10} credit(s)
      
      User's message: "${message}"
    `;

    let finalPrompt: any = prompt;
    if (fileData) {
      if (fileData.mimeType.startsWith('image/') || fileData.mimeType === 'application/pdf') {
        finalPrompt = [
          prompt,
          {
            inlineData: {
              data: fileData.data,
              mimeType: fileData.mimeType
            }
          }
        ];
      } else {
        // Plain text file (CSV/TXT)
        finalPrompt = prompt + `\n\nFile Content (${fileData.name}):\n${fileData.data}`;
      }
    }

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;

    let actionExecuted: string | null = null;

    if (isAgentMode) {
      const functionCalls = response.functionCalls();
      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          if (call.name === 'addExpense') {
            const { title, amount, category, paymentMethod } = call.args as any;
            await ensureCategoryExists(category || 'Other', userId);
            const today = new Date().toISOString().split('T')[0];
            const newExp = new Expense({
              title: title || category || 'Expense',
              amount: Number(amount),
              category: category || 'Other',
              date: today,
              paymentMethod: paymentMethod || 'UPI / Digital',
              userId,
            });
            await newExp.save();
            actionExecuted = `Added Expense: ${title} (₹${amount}) in ${category}`;
          } else if (call.name === 'addGoal') {
            const { title, targetAmount, deadline, autoSaveAmount } = call.args as any;
            const defaultDeadline = new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0];
            const newGoal = new Goal({
              title,
              targetAmount: Number(targetAmount),
              currentAmount: 0,
              deadline: deadline || defaultDeadline,
              color: '#6366f1',
              icon: '🎯',
              autoSaveAmount: autoSaveAmount ? Number(autoSaveAmount) : 0,
              userId,
            });
            await newGoal.save();
            actionExecuted = `Created Goal: ${title} (Target: ₹${targetAmount})`;
          } else if (call.name === 'setBudget' || call.name === 'addCategory') {
            const { category, allocated } = call.args as any;
            const budgetAmt = allocated ? Number(allocated) : 0;
            
            // 1. Ensure category is present in AppSetting.categories
            await ensureCategoryExists(category, userId);
            
            // 2. Upsert into Budget collection so it shows in Monthly Budgets
            await (Budget as any).findOneAndUpdate(
              { category, userId },
              { category, allocated: budgetAmt, userId },
              { upsert: true, new: true }
            );
            
            actionExecuted = `Added Category & Set Budget: ${category} set to ₹${budgetAmt}`;
          } else if (call.name === 'bulkAddExpenses') {
            const { expenses: extractedExpenses } = call.args as any;
            if (extractedExpenses && Array.isArray(extractedExpenses)) {
              for (const exp of extractedExpenses) {
                await ensureCategoryExists(exp.category || 'Other', userId);
                const expDate = exp.date || new Date().toISOString().split('T')[0];
                const newExp = new Expense({
                  title: exp.title || exp.category || 'Expense',
                  amount: Number(exp.amount),
                  category: exp.category || 'Other',
                  date: expDate,
                  paymentMethod: exp.paymentMethod || 'UPI / Digital',
                  userId,
                });
                await newExp.save();
              }
              actionExecuted = `Bulk Added ${extractedExpenses.length} expenses from file.`;
            }
          }
        }
      }
    }

    let text = '';
    try {
      text = response.text();
    } catch (e) {
      if (actionExecuted) {
        text = `Done! I have executed your request: **${actionExecuted}**`;
      }
    }

    if (!text && actionExecuted) {
      text = `Done! I have executed your request: **${actionExecuted}**`;
    }

    data.credits -= creditCost;
    data.requestCount += 1;

    if (data.requestCount >= 500) {
      data.blockedUntil = now + FIVE_HOURS_MS;
    }

    setting.value = data;
    setting.markModified('value');
    await setting.save();

    await CreditLog.create({
      userId,
      action: isAgentMode ? 'Spent on Agent Mode' : 'Spent on Chat Mode',
      amount: creditCost,
      details: actionExecuted ? `Action: ${actionExecuted}` : 'Standard request',
    });

    res.json({
      text,
      actionExecuted,
      creditsRemaining: data.credits,
      requestCount: data.requestCount,
      creditCost,
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const errorMessage = error.message || 'Failed to generate AI response. Please ensure your image/file is clear and related to expenses.';
    res.status(500).json({ error: `AI Error: ${errorMessage}` });
  }
};
