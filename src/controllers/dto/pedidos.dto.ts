export interface PedidoCriarDto {
  itens: Array<{
    produtoId: string;
    quantidade: number;
  }>;
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  metodoPagamento: 'CARTAO' | 'PIX' | 'BOLETO';
}

export interface PedidoItemDto {
  id: string;
  produtoId: string;
  nomeProduto: string;
  precoNaCompra: number;
  quantidade: number;
  vendedorId: string;
}

export interface PedidoCriadoDto {
  id: string;
  clienteId: string;
  subtotal: number;
  total: number;
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  metodoPagamento: 'CARTAO' | 'PIX' | 'BOLETO';
  status: 'PENDENTE' | 'PROCESSANDO' | 'CONCLUIDO' | 'CANCELADO';
  itens: PedidoItemDto[];
  createdAt: Date;
  updatedAt: Date;
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
