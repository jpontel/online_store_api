import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import {
  UsuarioCriarDto,
  UsuarioLoginDto,
  UsuarioAutenticadoDto,
  UsuarioRemovidoDto,
  UsuarioRemoverDto
} from './dto/auth.dto';

export const registrar = async (
  req: Request<{}, {}, UsuarioCriarDto>,
  res: Response<UsuarioAutenticadoDto>,
  next: NextFunction
) => {
  try {

    const usuarioRegistradoDto = await authService.registrarUsuario(req.body);
    res.status(201).json(usuarioRegistradoDto);

  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<{}, {}, UsuarioLoginDto>,
  res: Response<UsuarioAutenticadoDto>,
  next: NextFunction
) => {
  try {
    
    const usuarioAutenticadoDto = await authService.login(req.body);
    res.json(usuarioAutenticadoDto);
    
  } catch (error) {
    next(error);
  }
};

export const deletarConta = async (
  req: Request,
  res: Response<UsuarioRemovidoDto>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ mensagem: 'Não autenticado' } as any);
    }

    const usuarioRemoverDto: UsuarioRemoverDto = {
      usuarioId: req.user.id
    };

    const usuarioRemovidoDto = await authService.deletarConta(usuarioRemoverDto);

    res.json(usuarioRemovidoDto);
  } catch (error) {
    next(error);
  }
};
