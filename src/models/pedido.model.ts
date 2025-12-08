export enum MetodoPagamento {
  CARTAO = 'CARTAO',
  PIX = 'PIX',
  BOLETO = 'BOLETO'
}

export enum StatusPedido {
  PENDENTE = 'PENDENTE',
  PROCESSANDO = 'PROCESSANDO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO'
}

export interface IEndereco {
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface IPedido {
  id: string;
  clienteId: string;
  subtotal: number;
  total: number;
  endereco: IEndereco;
  metodoPagamento: MetodoPagamento;
  status: StatusPedido;
  dataCriacao: Date;
  updatedAt: Date;
}

export interface IItemPedido {
  id: string;
  pedidoId: string;
  produtoId: string;
  vendedorId: string;
  nomeProduto: string;
  valorTotal: number;
  quantidade: number;
  dataCriacao: Date;
}

export interface PedidoRow {
  id: string;
  cliente_id: string;
  subtotal: number;
  total: number;
  endereco_json: IEndereco;
  metodo_pagamento: MetodoPagamento;
  status: StatusPedido;
  data_criacao: string;
  data_ultima_atualizacao: string;
}

export interface ItemPedidoRow {
  id: string;
  pedido_id: string;
  produto_id: string;
  vendedor_id: string;
  nome_produto: string;
  valor_total: number;
  quantidade: number;
  data_criacao: string;
}

export interface IPedidoCompleto extends IPedido {
  itens: IItemPedido[];
}

export function pedidoRowToModel(row: PedidoRow): IPedido {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    subtotal: row.subtotal,
    total: row.total,
    endereco: row.endereco_json,
    metodoPagamento: row.metodo_pagamento,
    status: row.status,
    dataCriacao: new Date(row.data_criacao),
    updatedAt: new Date(row.data_ultima_atualizacao

    )
  };
}

export function itemPedidoRowToModel(row: ItemPedidoRow): IItemPedido {
  return {
    id: row.id,
    pedidoId: row.pedido_id,
    produtoId: row.produto_id,
    vendedorId: row.vendedor_id,
    nomeProduto: row.nome_produto,
    valorTotal: row.valor_total,
    quantidade: row.quantidade,
    dataCriacao: new Date(row.data_criacao)
  };
}

export function pedidoModelToInsert(pedido: Partial<IPedido>): Partial<PedidoRow> {
  return {
    cliente_id: pedido.clienteId,
    subtotal: pedido.subtotal,
    total: pedido.total,
    endereco_json: pedido.endereco,
    metodo_pagamento: pedido.metodoPagamento,
    status: pedido.status
  };
}

export function itemPedidoModelToInsert(item: Partial<IItemPedido>): Partial<ItemPedidoRow> {
  return {
    pedido_id: item.pedidoId,
    produto_id: item.produtoId,
    vendedor_id: item.vendedorId,
    nome_produto: item.nomeProduto,
    valor_total: item.valorTotal,
    quantidade: item.quantidade
  };
}
