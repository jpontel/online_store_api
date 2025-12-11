export interface DashboardDto {
   totalProdutosVendidos: number;
   faturamentoTotal: number;
   quantidadeProdutosCadastrados: number;
   produtoMaisVendido: ProdutoMaisVendido | null;
}

interface ProdutoMaisVendido {
   id: string;
   nome: string;
   quantidadeVendida: number;
}
