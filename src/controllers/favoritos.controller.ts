import { Request, Response, NextFunction } from 'express';
import * as favoritosService from '../services/favoritos.service';
import {
  FavoritoAdicionarDto,
  Favorito,
  FavoritosRecuperadoDto,
  FavoritoAlterarDto
} from './dto/favoritos.dto';

export const listarFavoritos = async (
  req: Request,
  res: Response<FavoritosRecuperadoDto>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' } as any);
    }

    const favorites = await favoritosService.listarFavoritos(req.user.id);
    res.json(favorites);
  } catch (error) {
    next(error);
  }
};

export const adicionarFavorito = async (
  req: Request<{}, {}, FavoritoAdicionarDto>,
  res: Response,
  next: NextFunction
) => {
   try {
      if (!req.user) {
         return res.status(401).json({ message: 'Não autenticado' } as any);
      }

      await favoritosService.adicionarFavorito(req.user.id, req.body);

      res.status(201).json({message: "Produto adicionado aos favoritos!"});

   } catch (error) {
      next(error);
   }
};

export const removerFavorito = async (
  req: Request<{}, {}, FavoritoAlterarDto>,
  res: Response<{ message: string }>,
  next: NextFunction
) => {
  try {
      if (!req.user) {
         return res.status(401).json({ message: 'Não autenticado' } as any);
      }

      await favoritosService.removerFavorito(req.body);

      res.json({ message: 'Favorito removido com sucesso' });
  } catch (error) {
    next(error);
  }
};
