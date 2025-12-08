// Favorites service - handles business logic for favorites operations

import { supabase } from '../config/database';
import {
  FavoritoAdicionarDto,
  FavoritoDto,
  FavoritoListagemDto
} from '../controllers/dto/favoritos.dto';
import { ProdutoRow } from '../models/produto.model';

export const listarFavoritos = async (clienteId: string): Promise<FavoritoListagemDto> => {

  const { data: favoritos, error } = await supabase
    .from('favoritos')
    .select(`
      *,
      produtos:produto_id (
        id,
        nome,
        preco,
        descricao,
        url_imagens,
        ativo
      )
    `)
    .eq('cliente_id', clienteId)
    .order('data_criacao', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error);
    throw { status: 500, message: 'Erro ao buscar favoritos' };
  }

  const favoritosAtivos = (favoritos || []).filter((fav: any) => fav.produtos && fav.produtos.ativo);

  const favoritosDto: FavoritoDto[] = favoritosAtivos.map((fav: any) => ({
    id: fav.id,
    produtoId: fav.produto_id,
    nomeProduto: fav.produtos.nome,
    precoProduto: fav.produtos.preco,
    urlImagens: fav.produtos.url_imagens,
    descricao: fav.produtos.descricao,
    dataCriacao: new Date(fav.data_criacao)
  }));

  const favoritoListagemDto: FavoritoListagemDto = {
    favoritos: favoritosDto,
    total: favoritos.length
  };

  return favoritoListagemDto;
};

export const adicionarFavorito = async (
  clienteId: string,
  data: FavoritoAdicionarDto
): Promise<FavoritoDto> => {
  const { produtoId } = data;

  const { data: produto, error: produtoError } = await supabase
    .from('produtos')
    .select('*')
    .eq('id', produtoId)
    .single();

  if (produtoError || !produto) {
    throw { status: 404, message: 'Produto não encontrado' };
  }

  const produtoRow = produto as ProdutoRow;

  if (!produtoRow.ativo) {
    throw { status: 400, message: 'Produto não está disponível' };
  }

  const { data: existingFavorite, error: checkError } = await supabase
    .from('favoritos')
    .select('id')
    .eq('cliente_id', clienteId)
    .eq('produto_id', produtoId)
    .single();

  if (existingFavorite) {
    throw { status: 400, message: 'Produto já está nos favoritos' };
  }

  const { data: newFavorite, error: insertError } = await supabase
    .from('favoritos')
    .insert({
      cliente_id: clienteId,
      produto_id: produtoId
    })
    .select()
    .single();

  if (insertError || !newFavorite) {
    console.error('Error adding favorite:', insertError);
    throw { status: 500, message: 'Erro ao adicionar favorito' };
  }

  const favoritoDto: FavoritoDto = {
    id: newFavorite.id,
    produtoId: produtoRow.id,
    nomeProduto: produtoRow.nome,
    precoProduto: produtoRow.preco,
    urlImagens: produtoRow.url_imagens,
    descricao: produtoRow.descricao,
    dataCriacao: new Date(newFavorite.data_criacao)
  };

  return favoritoDto;
    
};

export const removerFavorito = async (clienteId: string, produtoId: string): Promise<void> => {
  const { data: favorito, error: favoritoError } = await supabase
    .from('favoritos')
    .select('id')
    .eq('cliente_id', clienteId)
    .eq('produto_id', produtoId)
    .single();

  if (favoritoError || !favorito) {
    throw { status: 404, message: 'Favorito não encontrado' };
  }

  const { error: deleteError } = await supabase
    .from('favoritos')
    .delete()
    .eq('id', favorito.id);

  if (deleteError) {
    throw { status: 500, message: 'Erro ao remover favorito' };
  }
};
