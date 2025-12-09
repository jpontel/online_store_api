import { Router } from 'express';
import {
  recuperarProdutos,
  recuperarProduto,
  criarProduto,
  alterarProduto,
  deletarProduto,
  bulkUploadCSV
} from '../controllers/produtos.controller';
import { autenticarUsuario, validarTipoUsuario } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', recuperarProdutos);
router.get('/:id', recuperarProduto);

// Protected routes (seller only)
router.post('/', autenticarUsuario, validarTipoUsuario('SELLER'), criarProduto);
router.post('/bulk-csv', autenticarUsuario, validarTipoUsuario('SELLER'), bulkUploadCSV);
router.put('/:id', autenticarUsuario, validarTipoUsuario('SELLER'), alterarProduto);
router.delete('/:id', autenticarUsuario, validarTipoUsuario('SELLER'), deletarProduto);

export default router;
