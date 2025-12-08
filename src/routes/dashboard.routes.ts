import { Router } from 'express';
import { recuperarDashboard } from '../controllers/dashboard.controller';
import { autenticar, requireRole } from '../middleware/auth';

const router = Router();

// Dashboard route requires authentication and SELLER role
router.get('/', autenticar, requireRole('SELLER'), recuperarDashboard);

export default router;
