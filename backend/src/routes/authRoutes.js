import express from 'express';
import { register, login, subscribe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/subscribe', requireAuth, subscribe);

export default router;
