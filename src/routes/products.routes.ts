import { Router } from 'express';
import {
  recuperarProdutos,
  recuperarProduto,
  criarProduto,
  alterarProduto,
  deletarProduto,
  bulkUploadCSV
} from '../controllers/produtos.controller';
import { autenticar, requireRole } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', recuperarProdutos);
router.get('/:id', recuperarProduto);

// Protected routes (seller only)
router.post('/', autenticar, requireRole('SELLER'), criarProduto);
router.post('/bulk-csv', autenticar, requireRole('SELLER'), bulkUploadCSV);
router.put('/:id', autenticar, requireRole('SELLER'), alterarProduto);
router.delete('/:id', autenticar, requireRole('SELLER'), deletarProduto);

export default router;
