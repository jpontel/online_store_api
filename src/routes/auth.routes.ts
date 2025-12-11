import { Router } from 'express';
import { registrarUsuario, login, deletarUsuario } from '../controllers/auth.controller';
import { autenticarUsuario } from '../middleware/auth';

const router = Router();

router.post('/registrar', registrarUsuario);
router.post('/login', login);

router.delete('/deletar', autenticarUsuario, deletarUsuario);

export default router;
