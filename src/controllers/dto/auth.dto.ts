import { TipoUsuario, UsuarioModel } from "../../models/usuarios.model";
import { Status } from "../../utils/dto/common.dto";

export interface UsuarioCriarDto {
   nome: string;
   sobrenome: string;
   email: string;
   senha: string;
   tipoUsuario: TipoUsuario;
   nomeLoja?: string;
   cnpj?: string;
   telefone_pessoal?: number;
   telefone_comercial?: number;
}

export interface UsuarioCriadoDto {
   // Propriedades que o front possa precisar após a criação do usuário...
}

export interface UsuarioAlterarDto {
   usuarioId: string;
}

export interface UsuarioAutenticarDto {
  email: string;
  senha: string;
}

export interface UsuarioRecuperarDto {
   usuarioId: string;
}

export interface UsuarioRecuperadoDto extends UsuarioModel {}

export interface UsuarioAutenticadoDto {
  token: string;
}

export interface Usuario {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  senha: string;
  tipoUsuario: TipoUsuario;
  status: Status;
  dataCriacao: Date;
  dataUltimaAtualizacao: Date;
}

export interface Vendedor extends Usuario {
   id:string;
   usuarioId: string;
   nomeLoja: string;
   cnpj: string;
   telefone_pessoal?: number;
   telefone_comercial?: number;
}

export interface Cliente extends Usuario {
   id: string;
   usuarioId: string;
   cpf: string;
   telefone: number;
}