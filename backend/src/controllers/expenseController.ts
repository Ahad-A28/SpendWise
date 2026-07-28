import type { Request, Response } from 'express';
import Expense from '../models/Expense';

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const expenses = await Expense.find({ userId }).sort({ date: -1, createdAt: -1 });
    
    const formatted = expenses.map(e => {
      const obj = e.toObject();
      obj.id = obj._id.toString();
      delete obj._id;
      delete obj.__v;
      return obj;
    });

    res.json(formatted);
  } catch (error) {
    console.error('Failed to fetch expenses', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

export const addExpense = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const newExpense = new Expense({ ...req.body, userId });
    await newExpense.save();
    
    const obj = newExpense.toObject();
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;

    res.status(201).json(obj);
  } catch (error) {
    console.error('Failed to create expense', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    await Expense.findOneAndDelete({ _id: id, userId });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete expense', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};
