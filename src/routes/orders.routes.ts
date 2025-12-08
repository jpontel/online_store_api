import { Router } from 'express';
import {
  criarPedido,
  recuperarHistorico,
  recuperarPedido
} from '../controllers/pedidos.controller';
import { autenticar, requireRole } from '../middleware/auth';

const router = Router();

// All order routes require authentication and CUSTOMER role
router.use(autenticar, requireRole('CUSTOMER'));

router.post('/', criarPedido);
router.get('/', recuperarHistorico);
router.get('/:id', recuperarPedido);

export default router;
