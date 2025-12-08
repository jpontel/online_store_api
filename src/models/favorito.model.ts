export interface IFavorito {
  id: string;
  clienteId: string;
  produtoId: string;
  dataCriacao: Date;
}

export interface FavoritoRow {
  id: string;
  cliente_id: string;
  produto_id: string;
  data_criacao: string;
}

export interface IFavoritoComProduto extends IFavorito {
  nomeProduto: string;
  precoProduto: number;
  urlImagens: string[];
  descricao: string;
}

export function favoritoRowToModel(row: FavoritoRow): IFavorito {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    produtoId: row.produto_id,
    dataCriacao: new Date(row.data_criacao)
  };
}

export function favoritoModelToInsert(favorito: Partial<IFavorito>): Partial<FavoritoRow> {
  return {
    cliente_id: favorito.clienteId,
    produto_id: favorito.produtoId
  };
}
