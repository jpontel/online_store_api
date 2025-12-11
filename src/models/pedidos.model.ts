export interface PedidoModel {
  
}

export type MetodoPagamento = 'CARTAO' | 'PIX' | 'BOLETO';

export type StatusPagamento = 'PENDENTE' | 'PROCESSANDO' | 'CONCLUIDO' | 'CANCELADO';