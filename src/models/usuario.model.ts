export enum TipoUsuario {
  COMPRADOR = 'COMPRADOR',
  VENDEDOR = 'VENDEDOR'
}

export enum StatusUsuario {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  EXCLUIDO = 'EXCLUIDO'
}

export interface IUsuario {
  id: string;
  email: string;
  senhaHash: string;
  tipo: TipoUsuario;
  status: StatusUsuario;
  nomeLoja?: string;
  cnpj?: string;
  dataCriacao: Date;
  dataUltimaAtualizacao: Date;
}

export interface UsuarioRow {
  id: string;
  email: string;
  senha_hash: string;
  tipo: TipoUsuario;
  status: StatusUsuario;
  nome_loja: string | null;
  cnpj: string | null;
  data_criacao: string;
  data_ultima_atualizacao: string;
}

export function usuarioRowToModel(row: UsuarioRow): IUsuario {
  return {
    id: row.id,
    email: row.email,
    senhaHash: row.senha_hash,
    tipo: row.tipo,
    status: row.status,
    nomeLoja: row.nome_loja || undefined,
    cnpj: row.cnpj || undefined,
    dataCriacao: new Date(row.data_criacao),
    dataUltimaAtualizacao: new Date(row.data_ultima_atualizacao)
  };
}

export function usuarioModelToInsert(usuario: Partial<IUsuario>): Partial<UsuarioRow> {
  return {
    email: usuario.email,
    senha_hash: usuario.senhaHash,
    tipo: usuario.tipo,
    status: usuario.status,
    nome_loja: usuario.nomeLoja || null,
    cnpj: usuario.cnpj || null
  };
}