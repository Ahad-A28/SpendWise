import express from 'express';
import { getBudgets, saveBudgets } from '../controllers/budgetController';

const router = express.Router();

router.route('/')
  .get(getBudgets)
  .post(saveBudgets);

export default router;
