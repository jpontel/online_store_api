import { Request, Response, NextFunction } from 'express';
import * as carrinhoService from '../services/carrinho.service';
import {
   CarrinhoRecuperadoDto,
   CarrinhoRecuperarDto,
   CarrinhoAlterarDto,
   Carrinho
} from './dto/carrinho.dto';

export const recuperarCarrinho = async (
  req: Request<{}, {}, CarrinhoRecuperarDto>,
  res: Response<CarrinhoRecuperadoDto>,
  next: NextFunction
) => {
   try {
      if (!req.user)
         return res.status(401).json({ mensagem: 'Não autenticado' } as any);

      const carrinhoRecuperadoDto = await carrinhoService.recuperarCarrinho(req.body);
      res.json(carrinhoRecuperadoDto);
   } catch (error) {
      next(error);
   }
};

export const adicionarItem = async (
  req: Request<{}, {}, CarrinhoAlterarDto>,
  res: Response,
  next: NextFunction
) => {
  try {
      if (!req.user) {
         return res.status(401).json({ mensagem: 'Não autenticado' } as any);
      }

      await carrinhoService.adicionarNovoItem(req.body);
      res.send().status(200);
   } catch (error) {
      next(error);
   }
};

export const alterarQuantidadeItem = async (
  req: Request<{}, {}, CarrinhoAlterarDto>,
  res: Response,
  next: NextFunction
) => {
   try {
      if (!req.user) {
         return res.status(401).json({ mensagem: 'Não autenticado' } as any);
      }

      await carrinhoService.alterarQuantidadeItem(req.body);
      res.send().status(200);

   } catch (error) {
      next(error);
   }
};

export const removerItem = async (
  req: Request<{}, {}, CarrinhoAlterarDto>,
  res: Response,
  next: NextFunction
) => {
   try {
      if (!req.user) 
      return res.status(401).json({ mensagem: 'Não autenticado' } as any);

      await carrinhoService.removerItem(req.body);

      res.send().status(200);

   } catch (error) {
      next(error);
   }
};
