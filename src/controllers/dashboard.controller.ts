import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.service';
import { DashboardResponseDto } from './dto/dashboard.dto';

export const recuperarDashboard = async (
  req: Request,
  res: Response<DashboardResponseDto>,
  next: NextFunction
) => {
  try {
    
    if (!req.user) 
      return res.status(401).json({ message: 'Não autenticado' } as any);

    const dashboard = await dashboardService.recuperarDashboard(req.user.id);
    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};
