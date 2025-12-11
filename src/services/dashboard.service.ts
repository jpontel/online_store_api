// Dashboard service - handles business logic for seller dashboard analytics

import { supabase } from '../config/database';
import { DashboardDto } from '../controllers/dto/dashboard.dto';

export const recuperarDashboard = async (vendedorId: string): Promise<DashboardDto> => {
  try {

    // Query 1: Total de vendas
    const { data: dadosVendas, error: salesError } = await supabase
      .from('itens_pedido')
      .select('quantidade, preco_na_compra')
      .eq('vendedor_id', vendedorId);

    if (salesError) {
      throw { status: 500, message: 'Erro ao buscar dados de vendas' };
    }

    let totalProdutosVendidos = 0;
    let faturamentoTotal = 0;

    (dadosVendas || []).forEach((item: any) => {
      totalProdutosVendidos += item.quantidade;
      faturamentoTotal += item.quantidade * item.preco_na_compra;
    });

    // Query 2: Contagem de produtos registrados
    const { count: contagemProdutos, error: countError } = await supabase
      .from('produtos')
      .select('id', { count: 'exact', head: true })
      .eq('vendedor_id', vendedorId);

    if (countError) {
      console.error('Error counting products:', countError);
      throw { status: 500, message: 'Erro ao contar produtos cadastrados' };
    }

    const quantidadeProdutosCadastrados = contagemProdutos || 0;

    // Query 3: Produto mais vendido
    const { data: dadosProdutos, error: bestSellingError } = await supabase
      .from('itens_pedido')
      .select('produto_id, nome_produto, quantidade')
      .eq('vendedor_id', vendedorId);

    let produtoMaisVendido: { id: string; nome: string; quantidadeVendida: number } | null = null;

    if (dadosProdutos && dadosProdutos.length > 0) {
      
      const vendasProdutos = new Map<string, { nome: string; quantidade: number }>();

      dadosProdutos.forEach((item: any) => {

        if (vendasProdutos.has(item.produto_id)) {
          const existing = vendasProdutos.get(item.produto_id)!;
          existing.quantidade += item.quantidade;
          
        } else {

          vendasProdutos.set(item.produto_id, {
            nome: item.nome_produto,
            quantidade: item.quantidade
          });

        }
      });

      let quantidade = 0;
      let produtoMaisVendidoId = '';
      let produtoMaisVendidoNome = '';

      vendasProdutos.forEach((value, key) => {
        if (value.quantidade > quantidade) {
          quantidade = value.quantidade;
          produtoMaisVendidoId = key;
          produtoMaisVendidoNome = value.nome;
        }
      });

      if (produtoMaisVendidoId) {
        produtoMaisVendido = {
          id: produtoMaisVendidoId,
          nome: produtoMaisVendidoNome,
          quantidadeVendida: quantidade
        };
      }
    }

    const dashboardResponseDto: DashboardDto = {
      totalProdutosVendidos,
      faturamentoTotal,
      quantidadeProdutosCadastrados,
      produtoMaisVendido
    };

    return dashboardResponseDto;

  } catch (error) {
    throw { status: 500, message: 'Erro ao buscar dados do dashboard' };
  }
};
