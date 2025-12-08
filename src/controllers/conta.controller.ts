import { Request, Response, NextFunction } from 'express';
import * as contaService from '../services/conta.service';
import {
  ContaVendedorDto,
  ContaVendedorAtualizarDto
} from './dto/conta.dto';
import { ProdutoListagemDto } from './dto/produtos.dto';

export const recuperarContaVendedor = async (
  req: Request,
  res: Response<ContaVendedorDto>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ mensagem: 'Não autenticado' } as any);
    }

    const account = await contaService.recuperarContaVendedor(req.user.id);
    res.json(account);
  } catch (error) {
    next(error);
  }
};

export const atualizarContaVendedor = async (
  req: Request<{}, {}, ContaVendedorAtualizarDto>,
  res: Response<ContaVendedorDto>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ mensagem: 'Não autenticado' } as any);
    }

    const account = await contaService.atualizarContaVendedor(req.user.id, req.body);
    res.json(account);
  } catch (error) {
    next(error);
  }
};

export const listarProdutosVendedor = async (
  req: Request<{}, {}, {}, { pagina?: string; limite?: string }>,
  res: Response<ProdutoListagemDto>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ mensagem: 'Não autenticado' } as any);
    }

    const pagina = parseInt(req.query.pagina || '1');
    const limite = parseInt(req.query.limite || '20');

    const products = await contaService.listarProdutosVendedor(req.user.id, pagina, limite);
    res.json(products);
  } catch (error) {
    next(error);
  }
};
