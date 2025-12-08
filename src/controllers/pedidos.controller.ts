import { Request, Response, NextFunction } from 'express';
import * as pedidosService from '../services/pedidos.service';
import {
  PedidoCriarDto,
  PedidoCriadoDto,
  PedidosListagemDto
} from './dto/pedidos.dto';

export const criarPedido = async (
  req: Request<{}, {}, PedidoCriarDto>,
  res: Response<PedidoCriadoDto>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' } as any);
    }

    const order = await pedidosService.criarPedido(req.user.id, req.body);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const recuperarHistorico = async (
  req: Request<{}, {}, {}, { page?: string; limit?: string }>,
  res: Response<PedidosListagemDto>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' } as any);
    }

    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '20');

    const orders = await pedidosService.recuperarHistorico(req.user.id, page, limit);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const recuperarPedido = async (
  req: Request<{ id: string }>,
  res: Response<PedidoCriadoDto>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' } as any);
    }

    const order = await pedidosService.recuperarPedido(req.params.id, req.user.id);
    res.json(order);
  } catch (error) {
    next(error);
  }
};
