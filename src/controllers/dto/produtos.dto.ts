import { ProdutoModel } from "../../models/produtos.model";
import { Status } from "../../utils/dto/common.dto";

export interface ProdutoCriarDto {
  nome: string;
  preco: number;
  descricao: string;
  urlImagens: string[];
}

export interface ProdutoAlterarDto {
  produtoId: string;
  nome?: string;
  valor?: number;
  descricao?: string;
  quantidade?: number;
  urlImagens?: string[];
  status?: Status;
}

export interface Produto {
  id: string;
  vendedorId: string;
  nome: string;
  valor: number;
  descricao: string;
  quantidadeCarrinho: number;
  urlImagens: string[];
  status: Status;
  dataCriacao: Date;
  dataUltimaAtualizacao: Date;
}

export interface ProdutoRecuperadoDto extends ProdutoModel {}

export interface ProdutoPesquisarDto {
  busca?: string;
  pagina?: number;
  limite?: number;
}

export interface ProdutoListarDto {
  produtos: Produto[];
  paginacao: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

export interface ProdutoUploadArquivoDto {
  produtos: ProdutoCriarDto[];
}

// Implementar streaming
// export interface ProdutoUploadArquivoRetornoDto {
//   sucesso: boolean;
//   criados: number;
//   falhados: number;
// }
