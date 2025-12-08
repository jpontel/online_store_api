import { Request, Response, NextFunction } from 'express';
import * as favoritosService from '../services/favoritos.service';
import {
  FavoritoAdicionarDto,
  FavoritoDto,
  FavoritoListagemDto
} from './dto/favoritos.dto';

export const listarFavoritos = async (
  req: Request,
  res: Response<FavoritoListagemDto>,
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
  res: Response<FavoritoDto>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' } as any);
    }

    const favorito = await favoritosService.adicionarFavorito(req.user.id, req.body);

    res.status(201).json(favorito);
  } catch (error) {
    next(error);
  }
};

export const removerFavorito = async (
  req: Request<{ produtoId: string }>,
  res: Response<{ message: string }>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' } as any);
    }

    await favoritosService.removerFavorito(req.user.id, req.params.produtoId);
    res.json({ message: 'Favorito removido com sucesso' });
  } catch (error) {
    next(error);
  }
};
