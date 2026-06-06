import express from 'express';
import { createCheckoutSession, handleWebhook } from '../controllers/stripeController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-checkout-session', requireAuth, createCheckoutSession);
router.post('/webhook', handleWebhook);

export default router;
