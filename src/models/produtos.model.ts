import { Status } from "../utils/dto/common.dto";

export interface ProdutoModel {
    id: string;
    nome: string;
    valor: number;
    vendedor_id: string;
    quantidade: number;
    status: Status;
}