import { Usuario } from "../controllers/dto/auth.dto";
import { Status } from "../utils/dto/common.dto";

export type TipoUsuario = 'CLIENTE' | 'VENDEDOR';

export enum TipoUsuarioEnum {
   CLIENTE = "CLIENTE",
   VENDEDOR = "VENDEDOR"
}

export interface UsuarioModel {
   id: string;
   nome: string;
   sobrenome: string;
   email: string;
   senha: string;
   tipo_usuario: TipoUsuario;
   status: Status;
   data_criacao: Date;
   data_ultima_atualizacao: Date;
}

export function usuarioToDto(usuario: UsuarioModel): Usuario {
   return {
      id: usuario.id,
      nome: usuario.nome,
      sobrenome: usuario.sobrenome,
      email: usuario.email,
      senha: usuario.senha,
      tipoUsuario: usuario.tipo_usuario as TipoUsuario,
      status: usuario.status as Status,
      dataCriacao: new Date(usuario.data_criacao),
      dataUltimaAtualizacao: new Date(usuario.data_criacao)
   };
};

export function usuarioToModel(usuario: Partial<Usuario>): Partial<UsuarioModel> {
   return {
      id: usuario.id,
      nome: usuario.nome,
      sobrenome: usuario.sobrenome,
      email: usuario.email,
      senha: usuario.senha,
      tipo_usuario: usuario.tipoUsuario,
      status: usuario.status,
      data_criacao: usuario.dataCriacao,
      data_ultima_atualizacao: usuario.dataUltimaAtualizacao
   };
}