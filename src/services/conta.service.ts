import { supabase } from '../config/database';
import {
  ContaVendedorDto,
  ContaVendedorAtualizarDto
} from '../controllers/dto/conta.dto';
import { ProdutoListagemDto } from '../controllers/dto/produtos.dto';
import { UsuarioRow } from '../models/usuario.model';
import { ProdutoRow } from '../models/produto.model';

export const recuperarContaVendedor = async (vendedorId: string): Promise<ContaVendedorDto> => {
  const { data: user, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', vendedorId)
    .single();

  if (error || !user) {
    throw { status: 404, message: 'Usuário não encontrado' };
  }

  const usuario = user as UsuarioRow;

  return {
    id: usuario.id,
    email: usuario.email,
    nomeLoja: usuario.nome_loja || null,
    cnpj: usuario.cnpj || null,
    status: usuario.status as 'ATIVO' | 'INATIVO' | 'EXCLUIDO',
    dataCriacao: new Date(usuario.data_criacao),
    dataUltimaAtualizacao: new Date(usuario.data_ultima_atualizacao)
  };
};

export const atualizarContaVendedor = async (
  vendedorId: string,
  data: ContaVendedorAtualizarDto
): Promise<ContaVendedorDto> => {
  const updateData: any = {};

  if (data.nomeLoja !== undefined) {
   updateData.nome_loja = data.nomeLoja;
  }

  if (data.cnpj !== undefined) {
   updateData.cnpj = data.cnpj;
  }

  if (Object.keys(updateData).length === 0) {
   throw { status: 400, message: 'Nenhum campo para atualizar' };
  }

  const { data: updatedUser, error } = await supabase
   .from('usuarios')
   .update(updateData)
   .eq('id', vendedorId)
   .select()
   .single();

  if (error || !updatedUser) {
   console.error('Error updating seller account:', error);
   throw { status: 500, message: 'Erro ao atualizar conta' };
  }

  const usuarioRow = updatedUser as UsuarioRow;

  return {
      id: usuarioRow.id,
      email: usuarioRow.email,
      nomeLoja: usuarioRow.nome_loja || null,
      cnpj: usuarioRow.cnpj || null,
      status: usuarioRow.status as 'ATIVO' | 'INATIVO' | 'EXCLUIDO',
      dataCriacao: new Date(usuarioRow.data_criacao),
      dataUltimaAtualizacao: new Date(usuarioRow.data_ultima_atualizacao)
  };
};

export const listarProdutosVendedor = async (
  vendedorId: string,
  pagina: number = 1,
  limite: number = 20
): Promise<ProdutoListagemDto> => {
  const offset = (pagina - 1) * limite;

  const { data: products, error, count } = await supabase
    .from('produtos')
    .select('*', { count: 'exact' })
    .eq('vendedor_id', vendedorId)
    .order('publicado_em', { ascending: false })
    .range(offset, offset + limite - 1);

  if (error) {
    console.error('Error fetching seller products:', error);
    throw { status: 500, message: 'Erro ao buscar produtos' };
  }

  const produtosDto = (products || []).map((row: any) => {
    const produtoRow = row as ProdutoRow;
    return {
      id: produtoRow.id,
      vendedorId: produtoRow.vendedor_id,
      nome: produtoRow.nome,
      preco: produtoRow.preco,
      descricao: produtoRow.descricao,
      urlImagens: produtoRow.url_imagens,
      publicadoEm: new Date(produtoRow.publicado_em),
      ativo: produtoRow.ativo,
      dataCriacao: new Date(produtoRow.data_criacao),
      dataUltimaAtualizacao: new Date(produtoRow.data_ultima_atualizacao)
    };
  });

  const total = count || 0;
  const totalPaginas = Math.ceil(total / limite);

  return {
   produtos: produtosDto,
   paginacao: {
      pagina,
      limite,
      total,
      totalPaginas
   }
  };
};
