// Dashboard DTOs - Data Transfer Objects for seller dashboard

export interface DashboardResponseDto {
  totalProdutosVendidos: number;
  faturamentoTotal: number;
  quantidadeProdutosCadastrados: number;
  produtoMaisVendido: {
    id: string;
    nome: string;
    quantidadeVendida: number;
  } | null;
}
