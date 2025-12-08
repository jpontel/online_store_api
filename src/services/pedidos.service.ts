import { supabase } from '../config/database';
import {
  PedidoCriarDto,
  PedidoCriadoDto,
  PedidosListagemDto,
  PedidoItemDto
} from '../controllers/dto/pedidos.dto';
import { PedidoRow, ItemPedidoRow } from '../models/pedido.model';
import { ProdutoRow } from '../models/produto.model';

export const criarPedido = async (
  clienteId: string,
  data: PedidoCriarDto
): Promise<PedidoCriadoDto> => {
  const { itens, endereco, metodoPagamento } = data;

  if (!itens || itens.length === 0)
    throw { status: 400, message: 'Pedido deve conter pelo menos um item' };

  const { data: produtos, error: productsError } = await supabase
    .from('produtos')
    .select('*')
    .in('id', itens.map(item => item.produtoId))
    .eq('ativo', true);

  if (productsError) {
    console.error('Error fetching products:', productsError);
    throw { status: 500, message: 'Erro ao buscar produtos' };
  }

  if (!produtos || produtos.length !== itens.length)
    throw { status: 400, message: 'Um ou mais produtos não estão disponíveis' };

  const productsMap = new Map<string, ProdutoRow>();

  produtos.forEach(p => productsMap.set(p.id, p as ProdutoRow));

  let total = 0;

  const orderItems: Array<{
    produto_id: string;
    vendedor_id: string;
    nome_produto: string;
    preco_na_compra: number;
    quantidade: number;
  }> = [];

  for (const item of itens) {
    const product = productsMap.get(item.produtoId);

    if (!product) {
      throw { status: 400, message: `Produto ${item.produtoId} não encontrado` };
    }

    if (item.quantidade <= 0) {
      throw { status: 400, message: 'Quantidade deve ser maior que zero' };
    }

    const itemTotal = product.preco * item.quantidade;
    total += itemTotal;

    orderItems.push({
      produto_id: product.id,
      vendedor_id: product.vendedor_id,
      nome_produto: product.nome,
      preco_na_compra: product.preco,
      quantidade: item.quantidade
    });
  }

  // Create order
  const { data: novoPedido, error: orderError } = await supabase
    .from('pedidos')
    .insert({
      cliente_id: clienteId,
      subtotal: total,
      total,
      endereco_json: endereco,
      metodo_pagamento: metodoPagamento,
      status: 'PENDENTE'
    })
    .select()
    .single();

  if (orderError || !novoPedido) {
    console.error('Error creating order:', orderError);
    throw { status: 500, message: 'Erro ao criar pedido' };
  }

  const pedidoRow = novoPedido as PedidoRow;

  // Create order items
  const orderItemsWithPedidoId = orderItems.map(item => ({
    ...item,
    pedido_id: pedidoRow.id
  }));

  const { data: createdItems, error: itemsError } = await supabase
    .from('itens_pedido')
    .insert(orderItemsWithPedidoId)
    .select();

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    // Try to rollback - delete the order
    await supabase.from('pedidos').delete().eq('id', pedidoRow.id);
    throw { status: 500, message: 'Erro ao criar itens do pedido' };
  }

  // Clear cart items that were ordered
  const { error: clearCartError } = await supabase
    .from('carrinho')
    .delete()
    .eq('cliente_id', clienteId)
    .in('produto_id', productIds);

  if (clearCartError) {
    console.error('Error clearing cart:', clearCartError);
    // Don't fail the order if cart clear fails
  }

  // Map order items to DTO
  const itensDto: PedidoItemDto[] = (createdItems || []).map((item: any) => ({
    id: item.id,
    produtoId: item.produto_id,
    nomeProduto: item.nome_produto,
    precoNaCompra: item.preco_na_compra,
    quantidade: item.quantidade,
    vendedorId: item.vendedor_id
  }));

  return {
    id: pedidoRow.id,
    clienteId: pedidoRow.cliente_id,
    subtotal: pedidoRow.subtotal,
    total: pedidoRow.total,
    endereco: pedidoRow.endereco_json,
    metodoPagamento: pedidoRow.metodo_pagamento,
    status: pedidoRow.status,
    itens: itensDto,
    createdAt: new Date(pedidoRow.data_criacao),
    updatedAt: new Date(pedidoRow.updated_at)
  };
};

export const recuperarHistorico = async (
  clienteId: string,
  page: number = 1,
  limit: number = 20
): Promise<PedidosListagemDto> => {
  const offset = (page - 1) * limit;

  // Fetch orders with count
  const { data: orders, error: ordersError, count } = await supabase
    .from('pedidos')
    .select('*', { count: 'exact' })
    .eq('cliente_id', clienteId)
    .order('data_criacao', { ascending: false })
    .range(offset, offset + limit - 1);

  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
    throw { status: 500, message: 'Erro ao buscar histórico de pedidos' };
  }

  if (!orders || orders.length === 0) {
    return {
      pedidos: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0
      }
    };
  }

  // Fetch order items for all orders
  const orderIds = orders.map(o => o.id);
  const { data: orderItems, error: itemsError } = await supabase
    .from('itens_pedido')
    .select('*')
    .in('pedido_id', orderIds);

  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
    throw { status: 500, message: 'Erro ao buscar itens dos pedidos' };
  }

  // Group items by order ID
  const itemsByOrderId = new Map<string, PedidoItemDto[]>();
  (orderItems || []).forEach((item: any) => {
    const orderItem: PedidoItemDto = {
      id: item.id,
      produtoId: item.produto_id,
      nomeProduto: item.nome_produto,
      precoNaCompra: item.preco_na_compra,
      quantidade: item.quantidade,
      vendedorId: item.vendedor_id
    };

    if (!itemsByOrderId.has(item.pedido_id)) {
      itemsByOrderId.set(item.pedido_id, []);
    }
    itemsByOrderId.get(item.pedido_id)!.push(orderItem);
  });

  // Map orders to DTO
  const pedidos: PedidoCriadoDto[] = orders.map((order: any) => {
    const pedidoRow = order as PedidoRow;

    return {
      id: pedidoRow.id,
      clienteId: pedidoRow.cliente_id,
      subtotal: pedidoRow.subtotal,
      total: pedidoRow.total,
      endereco: pedidoRow.endereco_json,
      metodoPagamento: pedidoRow.metodo_pagamento,
      status: pedidoRow.status,
      itens: itemsByOrderId.get(pedidoRow.id) || [],
      createdAt: new Date(pedidoRow.data_criacao),
      updatedAt: new Date(pedidoRow.updated_at)
    };
  });

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    pedidos,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
};

export const recuperarPedido = async (
  pedidoId: string,
  clienteId: string
): Promise<PedidoCriadoDto> => {
  // Fetch order
  const { data: order, error: orderError } = await supabase
    .from('pedidos')
    .select('*')
    .eq('id', pedidoId)
    .eq('cliente_id', clienteId)
    .single();

  if (orderError || !order) {
    throw { status: 404, message: 'Pedido não encontrado' };
  }

  const pedidoRow = order as PedidoRow;

  // Fetch order items
  const { data: orderItems, error: itemsError } = await supabase
    .from('itens_pedido')
    .select('*')
    .eq('pedido_id', pedidoId);

  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
    throw { status: 500, message: 'Erro ao buscar itens do pedido' };
  }

  // Map order items to DTO
  const itens: PedidoItemDto[] = (orderItems || []).map((item: any) => ({
    id: item.id,
    produtoId: item.produto_id,
    nomeProduto: item.nome_produto,
    precoNaCompra: item.preco_na_compra,
    quantidade: item.quantidade,
    vendedorId: item.vendedor_id
  }));

  return {
    id: pedidoRow.id,
    clienteId: pedidoRow.cliente_id,
    subtotal: pedidoRow.subtotal,
    total: pedidoRow.total,
    endereco: pedidoRow.endereco_json,
    metodoPagamento: pedidoRow.metodo_pagamento,
    status: pedidoRow.status,
    itens,
    createdAt: new Date(pedidoRow.data_criacao),
    updatedAt: new Date(pedidoRow.updated_at)
  };
};
