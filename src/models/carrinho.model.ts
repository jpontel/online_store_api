export interface IItemCarrinho {
  id: string;
  clienteId: string;
  produtoId: string;
  quantidade: number;
  createdAt: Date;
}

export interface ItemCarrinhoRow {
  id: string;
  cliente_id: string;
  produto_id: string;
  quantidade: number;
  data_criacao: string;
}

export interface IItemCarrinhoComProduto extends IItemCarrinho {
  nomeProduto: string;
  precoProduto: number;
  urlImagens: string[];
  vendedorId: string;
}

export function itemCarrinhoRowToModel(row: ItemCarrinhoRow): IItemCarrinho {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    produtoId: row.produto_id,
    quantidade: row.quantidade,
    createdAt: new Date(row.data_criacao)
  };
}

export function itemCarrinhoModelToInsert(item: Partial<IItemCarrinho>): Partial<ItemCarrinhoRow> {
  return {
    cliente_id: item.clienteId,
    produto_id: item.produtoId,
    quantidade: item.quantidade
  };
}
