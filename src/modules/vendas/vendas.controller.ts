import type { Request, Response } from 'express';
import ManipuladorResposta from '../../core/utils/manipulador-resposta.js';
import VendasService from './vendas.service.js';

export default class VendasController {
  static async listar(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ManipuladorResposta.sucesso(res, await VendasService.listar(tenant_id), 'Vendas listadas com sucesso');
  }

  static async obterPorId(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const venda = await VendasService.obterPorId(Number(req.params.id), tenant_id);
    if (!venda) {
      return ManipuladorResposta.erro(res, 'Venda não encontrada', 404);
    }
    return ManipuladorResposta.sucesso(res, venda, 'Venda encontrada com sucesso');
  }

  static async criar(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ManipuladorResposta.sucesso(res, await VendasService.criar(tenant_id, req.body), 'Venda registrada com sucesso', 201);
  }
}
