import express from 'express';
import { 
  getSuppliers, 
  getSupplierById, 
  getMyProfile, 
  upsertProfile, 
  deleteProfile 
} from '../controllers/supplierController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Rotas Públicas (Organizadores encontram fornecedores)
router.get('/', getSuppliers);
router.get('/details/:id', getSupplierById);

// Rotas Privadas (Administração do portfólio do próprio fornecedor)
router.get('/my-profile', requireAuth, getMyProfile);
router.post('/my-profile', requireAuth, upsertProfile);
router.delete('/my-profile', requireAuth, deleteProfile);

export default router;
