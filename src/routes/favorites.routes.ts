import { Router } from 'express';
import {
  listarFavoritos,
  adicionarFavorito,
  removerFavorito
} from '../controllers/favoritos.controller';
import { autenticar, requireRole } from '../middleware/auth';

const router = Router();

// All favorites routes require authentication and CUSTOMER role
router.use(autenticar, requireRole('CUSTOMER'));

router.get('/', listarFavoritos);
router.post('/', adicionarFavorito);
router.delete('/:produtoId', removerFavorito);

export default router;
