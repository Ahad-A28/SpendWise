import express from 'express';
import { getExpenses, addExpense, deleteExpense, deleteAllExpenses } from '../controllers/expenseController.js';

const router = express.Router();

router.route('/')
  .get(getExpenses)
  .post(addExpense)
  .delete(deleteAllExpenses);

router.route('/:id')
  .delete(deleteExpense);

export default router;
