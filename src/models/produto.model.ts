export interface IProduto {
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

export interface ProdutoRow {
  id: string;
  vendedor_id: string;
  nome: string;
  preco: number;
  descricao: string;
  url_imagens: string[];
  publicado_em: string;
  ativo: boolean;
  data_criacao: string;
  data_ultima_atualizacao: string;
}

export function produtoRowToModel(row: ProdutoRow): IProduto {
  return {
    id: row.id,
    vendedorId: row.vendedor_id,
    nome: row.nome,
    preco: row.preco,
    descricao: row.descricao,
    urlImagens: row.url_imagens,
    publicadoEm: new Date(row.publicado_em),
    ativo: row.ativo,
    dataCriacao: new Date(row.data_criacao),
    dataUltimaAtualizacao: new Date(row.data_ultima_atualizacao)
  };
}

export function produtoModelToInsert(produto: Partial<IProduto>): Partial<ProdutoRow> {
  return {
    vendedor_id: produto.vendedorId,
    nome: produto.nome,
    preco: produto.preco,
    descricao: produto.descricao,
    url_imagens: produto.urlImagens,
    publicado_em: produto.publicadoEm?.toISOString(),
    ativo: produto.ativo
  };
}
