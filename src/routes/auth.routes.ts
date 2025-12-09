import { Router } from 'express';
import { registrar, login, deletarConta } from '../controllers/auth.controller';
import { autenticarUsuario } from '../middleware/auth';

const router = Router();

router.post('/registrar', registrar);
router.post('/login', login);

router.delete('/account', autenticarUsuario, deletarConta);

export default router;
