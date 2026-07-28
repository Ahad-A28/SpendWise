import express from 'express';
import { generateChatResponse, getAiCredits } from '../controllers/chatController.js';

const router = express.Router();

router.get('/credits', getAiCredits);
router.post('/', generateChatResponse);

export default router;
