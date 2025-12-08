// Product DTOs - Data Transfer Objects para produtos

export interface ProdutoCriarDto {
  nome: string;
  preco: number;
  descricao: string;
  urlImagens: string[];
}

export interface ProdutoAtualizarDto {
  nome?: string;
  preco?: number;
  descricao?: string;
  urlImagens?: string[];
  ativo?: boolean;
}

export interface ProdutoDto {
  id: string;
  vendedorId: string;
  nome: string;
  preco: number;
  descricao: string;
  urlImagens: string[];
  publicadoEm: Date;
  ativo: boolean;
  dataCriacao: Date;
  dataUltimaAtualizacao: Date;
}

export interface ProdutoPesquisarDto {
  busca?: string;
  pagina?: number;
  limite?: number;
}

export interface ProdutoListagemDto {
  produtos: ProdutoDto[];
  paginacao: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

export interface ProdutoUploadLoteDto {
  produtos: ProdutoCriarDto[];
}

export interface ProdutoUploadLoteRespostaDto {
  sucesso: boolean;
  criados: number;
  falhados: number;
  erros?: Array<{
    linha: number;
    erro: string;
  }>;
}
