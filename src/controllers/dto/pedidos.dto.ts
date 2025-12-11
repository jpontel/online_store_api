import { MetodoPagamento, StatusPagamento } from "../../models/pedidos.model";

export interface PedidoCriarDto {
   itens: Pedido[];
   endereco: {
      cep: string;
      rua: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      estado: string;
   };
   metodoPagamento: MetodoPagamento;
}

export interface PedidoCriadoDto{
   pedidoId: string;
   // (...) Outras propriedades que o front pode precisar
}

export interface PedidoRecuperarDto{
   pedidoId: string;
}

export interface PedidoRecuperadoDto{
   id: string;
   clienteId: string;
   valorTotal: number;
   endereco: {
      cep: string;
      rua: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      estado: string;
   };
   metodoPagamento: MetodoPagamento;
   status: StatusPagamento;
   itens: Pedido[];
   dataCriacao: Date;
   dataUltimaAtualizacao: Date;
}

export interface PedidosListagemDto {
   pedidos: PedidoCriadoDto[];
   pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
   };
}

export interface Pedido {
  id: string;
  produtoId: string;
  nome: string;
  valor: number;
  quantidade: number;
}



