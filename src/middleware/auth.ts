import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database';
import { TipoUsuario, StatusUsuario, UsuarioRow } from '../models/usuario.model';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'CUSTOMER' | 'SELLER';
        tipo: TipoUsuario;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  papel: TipoUsuario;
  iat?: number;
  exp?: number;
}

export const autenticar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }

    const { data: user, error: fetchError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (fetchError || !user) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }

    const usuarioRow = user as UsuarioRow;

    if (usuarioRow.status === StatusUsuario.EXCLUIDO || usuarioRow.status === StatusUsuario.INATIVO) {
      return res.status(403).json({ message: 'Conta inativa ou excluída' });
    }

    req.user = {
      id: usuarioRow.id,
      email: usuarioRow.email,
      role: usuarioRow.tipo === TipoUsuario.COMPRADOR ? 'CUSTOMER' : 'SELLER',
      tipo: usuarioRow.tipo
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Erro na autenticação' });
  }
};

export const requireRole = (role: 'CUSTOMER' | 'SELLER') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Acesso negado: permissões insuficientes' });
    }

    next();
  };
};
