export interface CarrinhoAdicionarItemDto {
  produtoId: string;
  quantidade: number;
}

export interface CarrinhoAtualizarItemDto {
  quantidade: number;
}

export interface CarrinhoItemDto {
  id: string;
  produtoId: string;
  nomeProduto: string;
  precoProduto: number;
  urlImagens: string[];
  quantidade: number;
  vendedorId: string;
  dataCriacao: Date;
}

export interface CarrinhoDto {
  itens: CarrinhoItemDto[];
  subtotal: number;
  quantidadeTotal: number;
}
