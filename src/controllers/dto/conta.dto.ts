export interface ContaVendedorDto {
  id: string;
  email: string;
  nomeLoja: string | null;
  cnpj: string | null;
  status: 'ATIVO' | 'INATIVO' | 'EXCLUIDO';
  dataCriacao: Date;
  dataUltimaAtualizacao: Date;
}

export interface ContaVendedorAtualizarDto {
  nomeLoja?: string;
  cnpj?: string;
}
