import express from 'express';
import { getCategories, saveCategories } from '../controllers/categoryController';

const router = express.Router();

router.route('/')
  .get(getCategories)
  .post(saveCategories);

export default router;
