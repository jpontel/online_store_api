import { Request, Response, NextFunction } from 'express';
import * as produtosService from '../services/produto.service';
import {
  ProdutoCriarDto,
  ProdutoAtualizarDto,
  ProdutoDto,
  ProdutoListagemDto,
  ProdutoPesquisarDto,
  ProdutoUploadLoteDto,
  ProdutoUploadLoteRespostaDto
} from './dto/produtos.dto';

export const recuperarProdutos = async (
  req: Request<{}, {}, {}, ProdutoPesquisarDto>,
  res: Response<ProdutoListagemDto>,
  next: NextFunction
) => {
  try {
    const products = await produtosService.recuperarProdutos(req.query);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const recuperarProduto = async (
  req: Request<{ id: string }>,
  res: Response<ProdutoDto>,
  next: NextFunction
) => {
  try {
    const product = await produtosService.recuperarProduto(req.params.id);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const criarProduto = async (
  req: Request<{}, {}, ProdutoCriarDto>,
  res: Response<ProdutoDto>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ mensagem: 'Não autenticado' } as any);
    }
    const product = await produtosService.criarProduto(req.body, req.user.id);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const alterarProduto = async (
  req: Request<{ id: string }, {}, ProdutoAtualizarDto>,
  res: Response<ProdutoDto>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ mensagem: 'Não autenticado' } as any);
    }
    const product = await produtosService.alterarProduto(req.params.id, req.body, req.user.id);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const deletarProduto = async (
  req: Request<{ id: string }>,
  res: Response<{ mensagem: string }>,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ mensagem: 'Não autenticado' } as any);
    }
    await produtosService.deletarProduto(req.params.id, req.user.id);
    res.json({ mensagem: 'Produto excluído com sucesso' });
  } catch (error) {
    next(error);
  }
};

export const bulkUploadCSV = async (
  req: Request<{}, {}, ProdutoUploadLoteDto>,
  res: Response<ProdutoUploadLoteRespostaDto>,
  next: NextFunction
) => {
  try {
    if (!req.user)
      return res.status(401).json({ mensagem: 'Não autenticado' } as any);

    const result = await produtosService.bulkUploadCSV(req.body, req.user.id);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};
