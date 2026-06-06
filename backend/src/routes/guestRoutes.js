import express from 'express';
import { 
  getGuests, 
  getGuestPublic, 
  createGuest, 
  updateGuest, 
  deleteGuest, 
  rsvpResponse,
  createGuestsBulk,
  checkInGuest
} from '../controllers/guestController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Rotas Públicas (para convidados externos confirmando presença no RSVP)
router.get('/public/:id', getGuestPublic);
router.patch('/public/:id/rsvp', rsvpResponse);

// Rotas Administrativas (Protegidas por autenticação JWT)
router.get('/', requireAuth, getGuests);
router.post('/', requireAuth, createGuest);
router.post('/bulk', requireAuth, createGuestsBulk);
router.put('/:id', requireAuth, updateGuest);
router.patch('/:id/checkin', requireAuth, checkInGuest);
router.delete('/:id', requireAuth, deleteGuest);

export default router;
