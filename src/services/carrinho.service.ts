// Cart service - handles business logic for shopping cart operations

import { supabase } from '../config/database';
import {
  CarrinhoAdicionarItemDto,
  CarrinhoAtualizarItemDto,
  CarrinhoItemDto,
  CarrinhoDto
} from '../controllers/dto/carrinho.dto';
import { ProdutoRow } from '../models/produto.model';

export const recuperarCarrinho = async (clienteId: string): Promise<CarrinhoDto> => {
   const { data: cartItems, error } = await supabase
      .from('carrinho')
      .select(`
      *,
      produtos:produto_id (
         id,
         nome,
         preco,
         url_imagens,
         vendedor_id,
         ativo
      )
      `)
      .eq('cliente_id', clienteId);

  if (error)
    throw { status: 500, message: 'Erro ao buscar carrinho' };

  const activeItems = (cartItems || []).filter((item: any) => item.produtos && item.produtos.ativo);

  const itens: CarrinhoItemDto[] = activeItems.map((item: any) => ({
    id: item.id,
    produtoId: item.produto_id,
    nomeProduto: item.produtos.nome,
    precoProduto: item.produtos.preco,
    urlImagens: item.produtos.url_imagens,
    quantidade: item.quantidade,
    vendedorId: item.produtos.vendedor_id,
    dataCriacao: new Date(item.created_at)
  }));

  const subtotal = itens.reduce((total, item) => total + (item.precoProduto * item.quantidade), 0);
  const quantidadeTotal = itens.reduce((total, item) => total + item.quantidade, 0);

  return {
    itens,
    subtotal,
    quantidadeTotal
  };
};

export const adicionarItem = async (
  clienteId: string,
  data: CarrinhoAdicionarItemDto
): Promise<CarrinhoItemDto> => {
  const { produtoId, quantidade } = data;

  if (quantidade <= 0) {
    throw { status: 400, message: 'Quantidade deve ser maior que zero' };
  }

  const { data: product, error: productError } = await supabase
    .from('produtos')
    .select('*')
    .eq('id', produtoId)
    .single();

  if (productError || !product) {
    throw { status: 404, message: 'Produto não encontrado' };
  }

  const produto = product as ProdutoRow;

  if (!produto.ativo) {
    throw { status: 400, message: 'Produto não está disponível' };
  }

  // Verificar se o item já existe no carrinho do usuário
  const { data: itemCarrinho, error: checkError } = await supabase
    .from('carrinho')
    .select('*')
    .eq('cliente_id', clienteId)
    .eq('produto_id', produtoId)
    .single();

  if (itemCarrinho) {
    // Se item já existe, atualiza a quantidade para mais um
    const quantidadeItemAlterada = itemCarrinho.quantidade + quantidade;

    const { data: itemAlterado, error: updateError } = await supabase
      .from('carrinho')
      .update({ quantidade: quantidadeItemAlterada })
      .eq('id', itemCarrinho.id)
      .select()
      .single();

    if (updateError || !itemAlterado)
      throw { status: 500, message: 'Erro ao atualizar item no carrinho' };

    return {
      id: itemAlterado.id,
      produtoId: produto.id,
      nomeProduto: produto.nome,
      precoProduto: produto.preco,
      urlImagens: produto.url_imagens,
      quantidade: quantidadeItemAlterada,
      vendedorId: produto.vendedor_id,
      dataCriacao: new Date(itemAlterado.created_at)
    };
  }

  const { data: newItem, error: insertError } = await supabase
    .from('carrinho')
    .insert({
      cliente_id: clienteId,
      produto_id: produtoId,
      quantidade
    })
    .select()
    .single();

  if (insertError || !newItem) 
    throw { status: 500, message: 'Erro ao adicionar item ao carrinho' };

  const itemCarrinhoRespostaDto: CarrinhoItemDto = {
    id: newItem.id,
    produtoId: produto.id,
    nomeProduto: produto.nome,
    precoProduto: produto.preco,
    urlImagens: produto.url_imagens,
    quantidade,
    vendedorId: produto.vendedor_id,
    dataCriacao: new Date(newItem.created_at)
  };

  return itemCarrinhoRespostaDto;
};

export const atualizarQuantidade = async (
  itemId: string,
  data: CarrinhoAtualizarItemDto,
  clienteId: string
): Promise<CarrinhoItemDto> => {
  const { quantidade } = data;

  if (quantidade <= 0) {
    throw { status: 400, message: 'Quantidade deve ser maior que zero' };
  }

  const { data: carrinho, error: recuperarItemCarrinhoErro } = await supabase
    .from('carrinho')
    .select(`
      *,
      produtos:produto_id (
        id,
        nome,
        preco,
        url_imagens,
        vendedor_id,
        ativo
      )
    `)
    .eq('id', itemId)
    .eq('cliente_id', clienteId)
    .single();

  if (recuperarItemCarrinhoErro || !carrinho)
    throw { status: 404, message: 'Item não encontrado no carrinho' };

  if (!carrinho.produtos || !carrinho.produtos.ativo)
    throw { status: 400, message: 'Produto não está mais disponível' };

  const { data: itemAlterado, error: itemAlteradoErro } = await supabase
    .from('carrinho')
    .update({ quantidade })
    .eq('id', itemId)
    .select()
    .single();

  if (itemAlteradoErro || !itemAlterado) 
    throw { status: 500, message: 'Erro ao atualizar quantidade' };

  const itemCarrinhoAlteradoDto: CarrinhoItemDto = {
    id: itemAlterado.id,
    produtoId: carrinho.produtos.id,
    nomeProduto: carrinho.produtos.nome,
    precoProduto: carrinho.produtos.preco,
    urlImagens: carrinho.produtos.url_imagens,
    quantidade,
    vendedorId: carrinho.produtos.vendedor_id,
    dataCriacao: new Date(itemAlterado.created_at)
  };

  return itemCarrinhoAlteradoDto;
};

export const removerItem = async (itemId: string, clienteId: string): Promise<void> => {
  const { data: existingItem, error: fetchError } = await supabase
    .from('carrinho')
    .select('id')
    .eq('id', itemId)
    .eq('cliente_id', clienteId)
    .single();

  if (fetchError || !existingItem) {
    throw { status: 404, message: 'Item não encontrado no carrinho' };
  }

  // Delete item
  const { error: deleteError } = await supabase
    .from('carrinho')
    .delete()
    .eq('id', itemId);

  if (deleteError) {
    console.error('Error removing cart item:', deleteError);
    throw { status: 500, message: 'Erro ao remover item do carrinho' };
  }
};

export const limparCarrinho = async (clienteId: string): Promise<void> => {
  const { error } = await supabase
    .from('carrinho')
    .delete()
    .eq('cliente_id', clienteId);

  if (error) {
    console.error('Error clearing cart:', error);
    throw { status: 500, message: 'Erro ao limpar carrinho' };
  }
};
