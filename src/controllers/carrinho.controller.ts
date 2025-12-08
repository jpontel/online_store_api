import { Request, Response, NextFunction } from 'express';
import * as carrinhoService from '../services/carrinho.service';
import {
  CarrinhoAdicionarItemDto,
  CarrinhoAtualizarItemDto,
  CarrinhoItemDto,
  CarrinhoDto
} from './dto/carrinho.dto';

export const recuperarCarrinho = async (
  req: Request,
  res: Response<CarrinhoDto>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ mensagem: 'Não autenticado' } as any);
    }

    const cart = await carrinhoService.recuperarCarrinho(req.user.id);
    res.json(cart);
  } catch (error) {
    next(error);
  }
};

export const adicionarItem = async (
  req: Request<{}, {}, CarrinhoAdicionarItemDto>,
  res: Response<CarrinhoItemDto>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ mensagem: 'Não autenticado' } as any);
    }

    const item = await carrinhoService.adicionarItem(req.user.id, req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const alterarQuantidadeItem = async (
  req: Request<{ id: string }, {}, CarrinhoAtualizarItemDto>,
  res: Response<CarrinhoItemDto>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ mensagem: 'Não autenticado' } as any);
    }

    const item = await carrinhoService.atualizarQuantidade(req.params.id, req.body, req.user.id);
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const removerItem = async (
  req: Request<{ id: string }>,
  res: Response<{ mensagem: string }>,
  next: NextFunction
) => {
  try {
    if (!req.user) 
      return res.status(401).json({ mensagem: 'Não autenticado' } as any);

    await carrinhoService.removerItem(req.params.id, req.user.id);

    res.json({ mensagem: 'Item removido do carrinho com sucesso' });
    
  } catch (error) {
    next(error);
  }
};
