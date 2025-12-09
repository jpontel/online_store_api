import { Router } from 'express';
import { recuperarDashboard } from '../controllers/dashboard.controller';
import { autenticarUsuario, validarTipoUsuario } from '../middleware/auth';
import { TipoUsuario } from '../models/usuario.model';

const router = Router();

router.get('/', autenticarUsuario, validarTipoUsuario(TipoUsuario.VENDEDOR), recuperarDashboard);

export default router;
