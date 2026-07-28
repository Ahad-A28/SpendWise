import type { Request, Response } from 'express';
import AppSetting from '../models/AppSetting.js';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const setting = await AppSetting.findOne({ key: 'categories', userId });
    
    if (setting && setting.value && Object.keys(setting.value).length > 0) {
      res.json(setting.value);
    } else {
      // Send and save a default category map if none exists
      const defaults = {
        'Food & Dining': { color: '#F59E0B', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: 'Utensils' },
        'Housing & Rent': { color: '#6366F1', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: 'Home' },
        'Shopping & Goods': { color: '#EC4899', bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20', icon: 'ShoppingBag' },
        'Entertainment & Fun': { color: '#8B5CF6', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: 'Film' },
        'Transportation': { color: '#3B82F6', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: 'Car' },
        'Utilities & Bills': { color: '#10B981', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: 'Zap' },
        'Subscriptions': { color: '#EF4444', bg: 'bg-red-500/10 text-red-400 border-red-500/20', icon: 'Tv' },
        'Healthcare & Fitness': { color: '#14B8A6', bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20', icon: 'Activity' },
        'Personal Care': { color: '#F43F5E', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: 'Sparkles' },
        'Miscellaneous': { color: '#6B7280', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: 'Grid' }
      };
      
      await AppSetting.findOneAndUpdate(
        { key: 'categories', userId },
        { key: 'categories', value: defaults, userId },
        { upsert: true, new: true }
      );
      
      res.json(defaults);
    }
  } catch (error) {
    console.error('Failed to fetch categories', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const saveCategories = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const data = req.body; 
    console.log('Saving categories for user:', userId, 'Data keys:', Object.keys(data));
    
    await AppSetting.findOneAndUpdate(
      { key: 'categories', userId },
      { key: 'categories', value: data, userId },
      { upsert: true, new: true }
    );
    
    console.log('Categories saved successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to save categories', error);
    res.status(500).json({ error: 'Failed to save categories' });
  }
};
