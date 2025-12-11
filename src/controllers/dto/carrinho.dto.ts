import { CarrinhoModel } from "../../models/carrinho.model";
import { Status } from "../../utils/dto/common.dto";
import { Produto } from "./produtos.dto";

export interface CarrinhoRecuperarDto {
   usuarioId: string;
}

export interface CarrinhoRecuperadoDto {
   produtos: CarrinhoProduto[];
   valorTotal: number;
}

// Dados do produto + propriedades específicas do usuário (quantidade, tamanho, cor....)
export interface CarrinhoProduto {
   nome: string;
   valor: number;
   quantidadeCarrinho: number;
}

export interface CarrinhoProdutoRecuperadoDto extends CarrinhoModel {
   nome: string;
   valor: number;
   status: Status;
}

// Poderiam haver n propriedades alteráveis dependendo do produto...
export interface CarrinhoAlterarDto {
   produtoId: string;
   usuarioId: string;
   quantidade?: number;
   // ... Outras props futuras
}

export interface Carrinho {
   usuarioId: string;
   produtoId: string;
   quantidade: number;
}
