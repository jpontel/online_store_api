import { Router } from 'express';
import {
  recuperarCarrinho,
  adicionarItem,
  alterarQuantidadeItem,
  removerItem
} from '../controllers/carrinho.controller';
import { autenticarUsuario, validarTipoUsuario } from '../middleware/auth';
import { TipoUsuario } from '../models/usuarios.model';

const router = Router();

router.use(autenticarUsuario, validarTipoUsuario(TipoUsuario.COMPRADOR));

router.get('/', recuperarCarrinho);
router.post('/itens', adicionarItem);
router.put('/itens/:id', alterarQuantidadeItem);
router.delete('/itens/:id', removerItem);

export default router;
