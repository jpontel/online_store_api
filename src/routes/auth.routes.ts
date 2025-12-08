import { Router } from 'express';
import { registrar, login, logout, deletarConta } from '../controllers/auth.controller';
import { autenticar } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', registrar);
router.post('/login', login);

// Protected routes
router.post('/logout', autenticar, logout);
router.delete('/account', autenticar, deletarConta);

export default router;
