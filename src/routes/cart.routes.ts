import { Router } from 'express';
import {
  recuperarCarrinho,
  adicionarItem,
  alterarQuantidadeItem,
  removerItem
} from '../controllers/carrinho.controller';
import { autenticar, requireRole } from '../middleware/auth';

const router = Router();

// All cart routes require authentication and CUSTOMER role
router.use(autenticar, requireRole('CUSTOMER'));

router.get('/', recuperarCarrinho);
router.post('/itens', adicionarItem);
router.put('/itens/:id', alterarQuantidadeItem);
router.delete('/itens/:id', removerItem);

export default router;
