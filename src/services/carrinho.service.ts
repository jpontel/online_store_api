import { supabase } from '../config/database';
import {
  CarrinhoAlterarDto,
  CarrinhoProduto,
  CarrinhoProdutoRecuperadoDto,
  CarrinhoRecuperadoDto,
  CarrinhoRecuperarDto
} from '../controllers/dto/carrinho.dto';
import { ProdutoRecuperadoDto } from '../controllers/dto/produtos.dto';
import { StatusEnum } from '../utils/dto/common.dto';

export const recuperarCarrinho = async (carrinhoRecuperarDto: CarrinhoRecuperarDto): Promise<CarrinhoRecuperadoDto> => {
   const { data: carrinho, error } = await supabase
      .from('carrinho')
      .select(`
         *,
         produto!inner(*)
      `)
      .eq('usuario_id', carrinhoRecuperarDto.usuarioId)
      .eq('produto.status', StatusEnum.ATIVO);

   if(error)
      throw { status: 500, message: 'Erro ao buscar carrinho' };

   const carrinhoProdutosRecuperadoDto: CarrinhoProdutoRecuperadoDto[] = carrinho;

   let carrinhoRecuperadoDto: CarrinhoRecuperadoDto = {
      produtos: [],
      valorTotal: 0
   };

   for (let i = 0; i < carrinhoProdutosRecuperadoDto.length; i++) {
      const p = carrinhoProdutosRecuperadoDto[i];

      const produto: CarrinhoProduto = {
         nome: p.nome,
         valor: p.valor,
         quantidadeCarrinho: p.quantidade
      };

      carrinhoRecuperadoDto.produtos.push(produto);
      
   }

   const valorTotal = carrinhoProdutosRecuperadoDto.reduce((total, produto) => {return total + produto.valor * produto.quantidade}, 0);

   carrinhoRecuperadoDto.valorTotal = valorTotal;

   return carrinhoRecuperadoDto;
};

export const adicionarNovoItem = async (carrinhoAlterarDto: CarrinhoAlterarDto): Promise<void> => {
   if (!carrinhoAlterarDto.quantidade || carrinhoAlterarDto.quantidade <= 0) {
      throw { status: 400, message: 'Quantidade deve ser maior que zero' };
   }

   const { data: produto, error: produtoErro } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', carrinhoAlterarDto.produtoId)
      .single();

   if (produtoErro || !produto) {
      throw { status: 404, message: 'Produto não encontrado' };
   }

   const produtoRecuperadoDto = produto as ProdutoRecuperadoDto;

   if (produtoRecuperadoDto.status === 'EXCLUIDO' || produtoRecuperadoDto.status === 'INATIVO') {
      throw { status: 400, message: 'Produto não está disponível' };
   }

   // Verificar se o item já existe no carrinho do usuário
   const { data: itemCarrinho, error: checkError } = await supabase
      .from('carrinho')
      .select('*')
      .eq('cliente_id', carrinhoAlterarDto.usuarioId)
      .eq('produto_id', carrinhoAlterarDto.produtoId)
      .single();

   if(itemCarrinho) {
      // Se item já existe, atualiza a quantidade para mais um
      const quantidadeItemAlterada = itemCarrinho.quantidade + carrinhoAlterarDto.quantidade;

      const { error: error } = await supabase
      .from('carrinho')
      .update({ quantidade: quantidadeItemAlterada })
      .eq('id', itemCarrinho.id)
      .select()
      .single();

      if (error)
      throw { status: 500, message: 'Erro ao atualizar item no carrinho' };
   }

   const { error: error } = await supabase
      .from('carrinho')
      .insert({
         cliente_id: carrinhoAlterarDto.usuarioId,
         produto_id: carrinhoAlterarDto.produtoId,
         quantidade: carrinhoAlterarDto.quantidade
      })
      .select()
      .single();

   if (error) 
      throw { status: 500, message: 'Erro ao adicionar item ao carrinho' };

};

export const alterarQuantidadeItem = async (carrinhoAlterarDto: CarrinhoAlterarDto): Promise<void> => {
   if(!carrinhoAlterarDto.quantidade || carrinhoAlterarDto.quantidade <= 0) {
      throw { status: 400, message: 'Quantidade deve ser maior que zero' };
   }

   const { data: carrinho, error: carrinhoErro } = await supabase
      .from('carrinho')
      .select()
      .eq('produto_id', carrinhoAlterarDto.produtoId)
      .eq('usuario_id', carrinhoAlterarDto.usuarioId)
      .single();

   if(carrinhoErro || !carrinho)
      throw { status: 404, message: 'Produto não encontrado no carrinho' };

   const carrinhoProdutoRecuperadoDto = carrinho as CarrinhoProdutoRecuperadoDto;

   if(carrinhoProdutoRecuperadoDto.status === 'EXCLUIDO' || carrinhoProdutoRecuperadoDto.status === 'INATIVO') {
      throw { status: 403, message: 'Produto indisponível!'};
   }

   const { error: error } = await supabase
      .from('carrinho')
      .update(carrinhoAlterarDto.quantidade)
      .eq('usuario_id', carrinhoAlterarDto.usuarioId)
      .eq('produto_id', carrinhoAlterarDto.produtoId);

   if(error) 
      throw { status: 500, message: 'Erro ao atualizar quantidade' };

};

export const removerItem = async (carrinhoAlterarDto: CarrinhoAlterarDto): Promise<void> => {
   const { data: produtoCarrinho, error: error } = await supabase
      .from('carrinho')
      .select('id')
      .eq('produto_id', carrinhoAlterarDto.produtoId)
      .eq('usuario_id', carrinhoAlterarDto.usuarioId)
      .single();

   if (error || !produtoCarrinho) {
      throw { status: 404, message: 'Item não encontrado no carrinho' };
   }

   const { error: deleteError } = await supabase
      .from('carrinho')
      .delete()
      .eq('id', carrinhoAlterarDto.produtoId);

   if (deleteError) {
      throw { status: 500, message: 'Erro ao remover item do carrinho' };
   }
};

export const limparCarrinho = async (carrinhoAlterarDto: CarrinhoAlterarDto): Promise<void> => {
   const {data: carrinho, error: carrinhoError} = await supabase
      .from('carrinho')
      .select()
      .eq('usuario_id', carrinhoAlterarDto.usuarioId);

   if(!carrinho || carrinhoError) {
      throw { status: 404, message: 'Ocorreu um erro ao recuperar as informações do carrinho!'};
   }

   const { error } = await supabase
      .from('carrinho')
      .delete()
      .eq('cliente_id', carrinhoAlterarDto);

   if (error) {
      throw { status: 500, message: 'Erro ao limpar carrinho' };
   }
};
