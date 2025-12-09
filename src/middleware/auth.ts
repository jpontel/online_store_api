import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database';
import { TipoUsuario, StatusUsuario, UsuarioRow } from '../models/usuario.model';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        tipo: TipoUsuario;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  tipo: TipoUsuario;
  iat?: number;
  exp?: number;
}

export const autenticarUsuario = async (
   req: Request, 
   res: Response, 
   next: NextFunction
) => {
  try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) 
         return res.status(401).json({ message: 'Token não fornecido' });

      const token = authHeader.split(' ')[1];

      let decoded: JwtPayload;

      try {
         decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      } catch (error) {
         return res.status(401).json({ message: 'Token inválido ou expirado' });
      }

      const { data: user, error: userError } = await supabase
         .from('usuarios')
         .select('*')
         .eq('id', decoded.userId)
         .single();

      if (userError || !user)
         return res.status(401).json({ message: 'Usuário não encontrado' });

      const usuarioRow = user as UsuarioRow;

      if (usuarioRow.status === StatusUsuario.EXCLUIDO || usuarioRow.status === StatusUsuario.INATIVO)
         return res.status(403).json({ message: 'Conta inativa ou excluída' });

      req.user = {
         id: usuarioRow.id,
         email: usuarioRow.email,
         tipo: usuarioRow.tipo
      };

      next();
  } catch (error) {
    res.status(401).json({ message: 'Erro na autenticação' });
  }
};

export const validarTipoUsuario = (tipoUsuario: TipoUsuario) => {
  return (req: Request, res: Response, next: NextFunction) => {

    if(!req.user)
      return res.status(401).json({ message: 'Não autenticado' });

    if (req.user.tipo !== tipoUsuario)
      return res.status(403).json({ message: 'Acesso negado: permissões insuficientes' });

    next();
  };
};
