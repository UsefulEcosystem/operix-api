import type { Request, Response } from 'express';
import TiposProdutoService from './tipos-produto.service.ts';
import ManipuladorResposta from '../../../core/utils/manipulador-resposta.ts';
import TiposProdutoModel from './tipos-produto.model.ts';

export default class TiposProdutoController {
  static async obterTodos(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ManipuladorResposta.sucesso(res, await TiposProdutoService.obterTodos(tenant_id), 'Tipos de produto listados com sucesso');
  }

  static async criar(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const typeData = TiposProdutoModel.deRequisicao({ ...req.body, tenant_id });
    return ManipuladorResposta.sucesso(res, await TiposProdutoService.criar(typeData), 'Tipo de produto criado com sucesso', 201);
  }

  static async remover(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ManipuladorResposta.sucesso(res, await TiposProdutoService.remover(req.params.id, tenant_id), 'Tipo de produto removido com sucesso', 204);
  }
}
