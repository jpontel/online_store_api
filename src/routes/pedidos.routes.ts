import { Router } from 'express';
import {
  criarPedido,
  recuperarHistorico,
  recuperarPedido
} from '../controllers/pedidos.controller';
import { autenticarUsuario, validarTipoUsuario } from '../middleware/auth';

const router = Router();

// All order routes require authentication and CUSTOMER role
router.use(autenticarUsuario, validarTipoUsuario('CUSTOMER'));

router.post('/', criarPedido);
router.get('/', recuperarHistorico);
router.get('/:id', recuperarPedido);

export default router;
