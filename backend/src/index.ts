import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';

// Load env FIRST before anything else
dotenv.config();

import connectDB from './config/db.js';

// Force Node.js to use Google DNS to resolve MongoDB SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

import expenseRoutes from './routes/expenseRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import mongoose from 'mongoose';

// Connect to database
connectDB().then(async () => {
  try {
    await mongoose.connection.collection('appsettings').dropIndex('key_1');
    console.log('Legacy key_1 index dropped successfully.');
  } catch (e: any) {
    // ignore if doesn't exist
  }
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

import { clerkMiddleware, getAuth } from '@clerk/express';
import type { Request, Response, NextFunction } from 'express';

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  if (!auth.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  (req as any).auth = auth;
  next();
};

// Routes
app.use('/api/expenses', clerkMiddleware(), requireAuth, expenseRoutes);
app.use('/api/budgets', clerkMiddleware(), requireAuth, budgetRoutes);
app.use('/api/categories', clerkMiddleware(), requireAuth, categoryRoutes);
app.use('/api/chat', clerkMiddleware(), requireAuth, chatRoutes);
app.use('/api/goals', clerkMiddleware(), requireAuth, goalRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
