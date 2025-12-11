import { Produto } from "./produtos.dto";

export interface FavoritoAdicionarDto {
   produtoId: string;
}

export interface FavoritoAlterarDto {
   produtoId: string;
   usuarioId: string;
}

export interface FavoritosRecuperarDto {
   usuarioId: string;
}

export interface FavoritosRecuperadoDto {
   favoritos: Produto[];
}
