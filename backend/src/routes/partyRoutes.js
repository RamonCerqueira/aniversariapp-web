import express from 'express';
import { getParties, createParty, updateParty, deleteParty } from '../controllers/partyController.js';
import { requireAuth } from '../middleware/auth.js';
import { checkPartyLimit } from '../middleware/limits.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getParties);
router.post('/', checkPartyLimit, createParty);
router.put('/:id', updateParty);
router.delete('/:id', deleteParty);

export default router;
