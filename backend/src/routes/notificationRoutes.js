import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearAll
} from '../controllers/notificationController.js';

const router = express.Router();

// Obter todas as notificações do usuário
router.get('/', requireAuth, getNotifications);

// Marcar uma notificação específica como lida
router.patch('/:id/read', requireAuth, markAsRead);

// Marcar todas como lidas
router.patch('/read-all', requireAuth, markAllAsRead);

// Limpar histórico de notificações
router.delete('/clear-all', requireAuth, clearAll);

export default router;
