import express from 'express';
import { getExpenses, addExpense, deleteExpense } from '../controllers/expenseController';

const router = express.Router();

router.route('/')
  .get(getExpenses)
  .post(addExpense);

router.route('/:id')
  .delete(deleteExpense);

export default router;
