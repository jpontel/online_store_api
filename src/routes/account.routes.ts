import { Router } from 'express';
import {
  recuperarContaVendedor,
  atualizarContaVendedor,
  listarProdutosVendedor
} from '../controllers/conta.controller';
import { autenticar, requireRole } from '../middleware/auth';

const router = Router();

// All account routes require authentication and SELLER role
router.use(autenticar, requireRole('SELLER'));

router.get('/conta', recuperarContaVendedor);
router.put('/conta', atualizarContaVendedor);
router.get('/produtos', listarProdutosVendedor);

export default router;
