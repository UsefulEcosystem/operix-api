import type { Request, Response } from 'express';
import EstoqueService from './estoque.service.js';
import ManipuladorResposta from '../../core/utils/manipulador-resposta.js';
import MensageriaService from '../../core/utils/mensageria.service.js';

export default class EstoqueController {
  static async obterTodos(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ManipuladorResposta.sucesso(res, await EstoqueService.obterTodos(tenant_id), 'Estoque listado com sucesso');
  }

  static async criar(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ManipuladorResposta.sucesso(res, await EstoqueService.criar(tenant_id, req.body), 'Item de estoque criado com sucesso', 201);
  }

  static async atualizar(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const { id } = req.params;
    const updated = await EstoqueService.atualizar(Number(id), tenant_id, req.body);
    if (updated && updated.quantity <= 5) {
      MensageriaService.notificarLocatario(tenant_id, '@stock/low_stock_alert', updated);
    }
    return ManipuladorResposta.sucesso(res, updated, 'Item de estoque atualizado com sucesso');
  }

  static async remover(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ManipuladorResposta.sucesso(res, await EstoqueService.remover(Number(req.params.id), tenant_id), 'Item de estoque removido com sucesso');
  }
}
