import type { Request, Response } from 'express';
import StatusPagamentoService from './status-pagamento.service.js';
import ManipuladorResposta from '../../core/utils/manipulador-resposta.js';

export default class StatusPagamentoController {
  static async obterTodos(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ManipuladorResposta.sucesso(res, await StatusPagamentoService.obterTodos(tenant_id), 'Status de pagamento listados com sucesso');
  }

  static async criar(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ManipuladorResposta.sucesso(res, await StatusPagamentoService.criar(tenant_id, req.body), 'Status de pagamento criado com sucesso', 201);
  }

  static async remover(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ManipuladorResposta.sucesso(res, await StatusPagamentoService.remover(Number(req.params.id), tenant_id), 'Status de pagamento removido com sucesso', 204);
  }
}
