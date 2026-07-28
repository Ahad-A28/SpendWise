import express from 'express';
import { getBudgets, saveBudgets } from '../controllers/budgetController.js';

const router = express.Router();

router.route('/')
  .get(getBudgets)
  .post(saveBudgets);

export default router;
