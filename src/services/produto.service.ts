// Product service - handles business logic for product operations

import { supabase } from '../config/database';
import {
  ProdutoCriarDto,
  ProdutoAtualizarDto,
  ProdutoDto,
  ProdutoListagemDto,
  ProdutoPesquisarDto,
  ProdutoUploadLoteDto,
  ProdutoUploadLoteRespostaDto
} from '../controllers/dto/produtos.dto';
import { ProdutoRow } from '../models/produto.model';

const produtoToDto = (row: ProdutoRow): ProdutoDto => {
  return {
    id: row.id,
    vendedorId: row.vendedor_id,
    nome: row.nome,
    preco: row.preco,
    descricao: row.descricao,
    urlImagens: row.url_imagens,
    publicadoEm: new Date(row.publicado_em),
    ativo: row.ativo,
    dataCriacao: new Date(row.data_criacao),
    dataUltimaAtualizacao: new Date(row.data_ultima_atualizacao)
  };
};

export const recuperarProdutos = async (produtoPesquisarDto: ProdutoPesquisarDto): Promise<ProdutoListagemDto> => {
  const {
    busca = '',
    pagina = 1,
    limite = 20,
  } = produtoPesquisarDto;

  const offset = (pagina - 1) * limite;

  let queryBuilder = supabase
    .from('produtos')
    .select('*', { count: 'exact' })
    .eq('ativo', true);

  if (busca) 
    queryBuilder = queryBuilder.ilike('nome', `%${busca}%`);

  const { data, error, count } = await queryBuilder
    .order('publicado_em', { ascending: false })
    .range(offset, offset + limite - 1);

  if (error)
    throw { status: 500, message: 'Erro ao buscar produtos' };

  const produtos = (data || []).map((row: any) => produtoToDto(row as ProdutoRow));
  const total = count || 0;
  const totalPaginas = Math.ceil(total / limite);

  const produtoListagemDto: ProdutoListagemDto = {
    produtos,
    paginacao: {
      pagina,
      limite,
      total,
      totalPaginas
    }
  };

  return produtoListagemDto;
};

export const recuperarProduto = async (id: string): Promise<ProdutoDto> => {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw { status: 404, message: 'Produto não encontrado' };
  }

  const produto = data as ProdutoRow;

  if (!produto.ativo) {
    throw { status: 404, message: 'Produto não encontrado' };
  }

  return produtoToDto(produto);
};

export const criarProduto = async (
  data: ProdutoCriarDto,
  vendedorId: string
): Promise<ProdutoDto> => {
  const { nome, preco, descricao, urlImagens } = data;

  // Validate data
  if (!nome || !preco || !urlImagens || urlImagens.length === 0) {
    throw { status: 400, message: 'Dados inválidos: nome, preço e imagens são obrigatórios' };
  }

  if (preco < 0) {
    throw { status: 400, message: 'Preço não pode ser negativo' };
  }

  // Insert product
  const { data: newProduct, error: insertError } = await supabase
    .from('produtos')
    .insert({
      vendedor_id: vendedorId,
      nome,
      preco,
      descricao,
      url_imagens: urlImagens,
      publicado_em: new Date().toISOString(),
      ativo: true
    })
    .select()
    .single();

  if (insertError || !newProduct) {
    console.error('Error creating product:', insertError);
    throw { status: 500, message: 'Erro ao criar produto' };
  }

  return produtoToDto(newProduct as ProdutoRow);
};

export const alterarProduto = async (
  id: string,
  data: ProdutoAtualizarDto,
  vendedorId: string
): Promise<ProdutoDto> => {
  // First, check if product exists and belongs to seller
  const { data: existingProduct, error: fetchError } = await supabase
    .from('produtos')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existingProduct) {
    throw { status: 404, message: 'Produto não encontrado' };
  }

  const produtoRow = existingProduct as ProdutoRow;

  // Verify ownership
  if (produtoRow.vendedor_id !== vendedorId) {
    throw { status: 403, message: 'Sem permissão para editar este produto' };
  }

  // Build update object
  const updateData: any = {};

  if (data.nome !== undefined) updateData.nome = data.nome;
  if (data.preco !== undefined) {
    if (data.preco < 0) {
      throw { status: 400, message: 'Preço não pode ser negativo' };
    }
    updateData.preco = data.preco;
  }
  if (data.descricao !== undefined) updateData.descricao = data.descricao;
  if (data.urlImagens !== undefined) updateData.url_imagens = data.urlImagens;
  if (data.ativo !== undefined) updateData.ativo = data.ativo;

  // Update product
  const { data: updatedProduct, error: updateError } = await supabase
    .from('produtos')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (updateError || !updatedProduct) {
    console.error('Error updating product:', updateError);
    throw { status: 500, message: 'Erro ao atualizar produto' };
  }

  return produtoToDto(updatedProduct as ProdutoRow);
};

export const deletarProduto = async (id: string, vendedorId: string): Promise<void> => {
  // First, check if product exists and belongs to seller
  const { data: existingProduct, error: fetchError } = await supabase
    .from('produtos')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existingProduct) {
    throw { status: 404, message: 'Produto não encontrado' };
  }

  const produtoRow = existingProduct as ProdutoRow;

  // Verify ownership
  if (produtoRow.vendedor_id !== vendedorId) {
    throw { status: 403, message: 'Sem permissão para excluir este produto' };
  }

  // Soft delete (set ativo to false)
  const { error: updateError } = await supabase
    .from('produtos')
    .update({ ativo: false })
    .eq('id', id);

  if (updateError) {
    console.error('Error deleting product:', updateError);
    throw { status: 500, message: 'Erro ao excluir produto' };
  }
};

export const bulkUploadCSV = async (
  data: ProdutoUploadLoteDto,
  vendedorId: string
): Promise<ProdutoUploadLoteRespostaDto> => {
  const { produtos } = data;
  let criados = 0;
  let falhados = 0;
  const erros: Array<{ linha: number; erro: string }> = [];

  for (let i = 0; i < produtos.length; i++) {
    const produto = produtos[i];
    const numeroLinha = i + 1;

    try {
      if (!produto.nome || !produto.preco || !produto.urlImagens || produto.urlImagens.length === 0) {
        throw new Error('Dados inválidos: nome, preço e imagens são obrigatórios');
      }

      if (produto.preco < 0) {
        throw new Error('Preço não pode ser negativo');
      }

      // Insert product
      const { error: insertError } = await supabase
        .from('produtos')
        .insert({
          vendedor_id: vendedorId,
          nome: produto.nome,
          preco: produto.preco,
          descricao: produto.descricao,
          url_imagens: produto.urlImagens,
          publicado_em: new Date().toISOString(),
          ativo: true
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      criados++;
    } catch (error: any) {
      falhados++;
      erros.push({
        linha: numeroLinha,
        erro: error.message || 'Erro desconhecido'
      });
    }
  }

  return {
    sucesso: falhados === 0,
    criados,
    falhados,
    erros: erros.length > 0 ? erros : undefined
  };
};
