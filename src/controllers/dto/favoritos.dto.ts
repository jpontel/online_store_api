// Favorites DTOs - Data Transfer Objects for favorites

export interface FavoritoAdicionarDto {
  produtoId: string;
}

export interface FavoritoDto {
  id: string;
  produtoId: string;
  nomeProduto: string;
  precoProduto: number;
  urlImagens: string[];
  descricao: string;
  dataCriacao: Date;
}

export interface FavoritoListagemDto {
  favoritos: FavoritoDto[];
  total: number;
}
