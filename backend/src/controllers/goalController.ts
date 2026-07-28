import type { Request, Response } from 'express';
import Goal from '../models/Goal';

export const getGoals = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
    const formatted = [];
    const now = new Date();

    for (const g of goals) {
      let needsSave = false;
      
      // Auto-save logic
      if (g.autoSaveAmount > 0 && g.currentAmount < g.targetAmount) {
        const lastSave = new Date(g.lastAutoSaveDate);
        // Calculate months elapsed (roughly 30 days)
        const msPerMonth = 1000 * 60 * 60 * 24 * 30;
        const monthsElapsed = Math.floor((now.getTime() - lastSave.getTime()) / msPerMonth);
        
        if (monthsElapsed > 0) {
          const catchUpAmount = monthsElapsed * g.autoSaveAmount;
          g.currentAmount = Math.min(g.targetAmount, g.currentAmount + catchUpAmount);
          g.lastAutoSaveDate = now;
          needsSave = true;
        }
      }

      if (needsSave) {
        await g.save();
      }

      const obj = g.toObject();
      obj.id = obj._id.toString();
      delete obj._id;
      delete obj.__v;
      formatted.push(obj);
    }

    res.json(formatted);
  } catch (error) {
    console.error('Failed to fetch goals', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
};

export const addGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const newGoal = new Goal({ ...req.body, userId });
    await newGoal.save();
    
    const obj = newGoal.toObject();
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;

    res.status(201).json(obj);
  } catch (error) {
    console.error('Failed to create goal', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
};

export const updateGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const updated = await Goal.findOneAndUpdate({ _id: id, userId }, req.body, { new: true });
    
    if (!updated) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const obj = updated.toObject();
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;

    res.json(obj);
  } catch (error) {
    console.error('Failed to update goal', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
};

export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    await Goal.findOneAndDelete({ _id: id, userId });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete goal', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
};

export const contributeToGoal = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const { amount } = req.body;
    
    const goal = await Goal.findOne({ _id: id, userId });
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    goal.currentAmount += Number(amount);
    await goal.save();

    const obj = goal.toObject();
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;

    res.json(obj);
  } catch (error) {
    console.error('Failed to contribute to goal', error);
    res.status(500).json({ error: 'Failed to contribute to goal' });
  }
};
