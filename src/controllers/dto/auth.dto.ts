import { TipoUsuario } from "../../models/usuario.model";

export interface UsuarioCriarDto {
  email: string;
  senha: string;
  tipo: TipoUsuario;
  nomeLoja?: string;
  cnpj?: string;
}

export interface UsuarioCriadoDto {
  
}

export interface UsuarioLoginDto {
  email: string;
  senha: string;
}

export interface UsuarioAutenticadoDto {
  usuario: UsuarioDto;
  token: string;
}

export interface UsuarioDto {
  id: string;
  email: string;
  tipo: 'COMPRADOR' | 'VENDEDOR';
  status: 'ATIVO' | 'INATIVO' | 'EXCLUIDO';
  dataCriacao: Date;
}

export interface UsuarioRemoverDto {
  usuarioId: string;
}

export interface UsuarioRemovidoDto {
  mensagem: string;
  dataExclusao: Date;
}
