import express from 'express';
import { 
  createLead, 
  getSupplierLeads, 
  getOrganizerLeads, 
  updateLeadStatus 
} from '../controllers/leadController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', createLead);
router.get('/supplier', getSupplierLeads);
router.get('/organizer', getOrganizerLeads);
router.patch('/:id/status', updateLeadStatus);

export default router;
