import express from 'express';
import { getChurrascoAiAdvice } from '../controllers/aiController.js';

const router = express.Router();

router.post('/churrasco', getChurrascoAiAdvice);

export default router;
