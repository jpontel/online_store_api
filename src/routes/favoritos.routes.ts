import { Router } from 'express';
import {
  listarFavoritos,
  adicionarFavorito,
  removerFavorito
} from '../controllers/favoritos.controller';
import { autenticarUsuario, validarTipoUsuario } from '../middleware/auth';

const router = Router();

router.use(autenticarUsuario, validarTipoUsuario('CUSTOMER'));

router.get('/', listarFavoritos);
router.post('/', adicionarFavorito);
router.delete('/:produtoId', removerFavorito);

export default router;
