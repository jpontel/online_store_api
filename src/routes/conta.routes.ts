import { autenticarUsuario, validarTipoUsuario } from '../middleware/auth';
import {
  recuperarContaVendedor,
  atualizarContaVendedor,
  listarProdutosVendedor
} from '../controllers/vendedor.controller';

import { TipoUsuario } from '../models/usuarios.model';

import { Router } from 'express';

const router = Router();

router.use(autenticarUsuario, validarTipoUsuario(TipoUsuario.VENDEDOR));

router.get('/conta', recuperarContaVendedor);
router.put('/atualiza-conta', atualizarContaVendedor);
router.get('/produtos', listarProdutosVendedor);

export default router;
