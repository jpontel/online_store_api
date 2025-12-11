import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import {
   UsuarioCriarDto,
   UsuarioAutenticarDto,
   UsuarioAutenticadoDto,
   UsuarioAlterarDto,
} from './dto/auth.dto';

export const registrarUsuario = async (
   req: Request<{}, {}, UsuarioCriarDto>,
   res: Response<UsuarioAutenticadoDto>,
   next: NextFunction
) => {
   try {

      const usuarioRegistrado = await authService.registrarUsuario(req.body);
      res.status(201).json(usuarioRegistrado);

   } catch (error) {
      next(error);
   }
};

export const login = async (
  req: Request<{}, {}, UsuarioAutenticarDto>,
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

export const deletarUsuario = async (
  req: Request<{}, {}, UsuarioAlterarDto>,
  res: Response,
  next: NextFunction
) => {
   try {
      if (!req.user) {
         return res.status(401).json({ mensagem: 'Não autenticado' } as any);
      }

      const usuarioRemovido = await authService.deletarUsuario(req.body);

      res.json(usuarioRemovido);
   } catch (error) {
      next(error);
   }
};
