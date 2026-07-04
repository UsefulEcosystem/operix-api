import type { Request, Response } from 'express';
import ManipuladorResposta from '../../../core/utils/manipulador-resposta.js';
import GarantiasService from './garantias.service.js';

export default class GarantiasController {
  static async listar(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ManipuladorResposta.sucesso(
      res,
      await GarantiasService.listar(tenant_id, req.query),
      'Garantias listadas com sucesso',
    );
  }

  static async obterPorId(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const garantia = await GarantiasService.obterPorId(req.params.id, tenant_id);
    if (!garantia) {
      return ManipuladorResposta.erro(res, 'Garantia não encontrada', 404);
    }
    return ManipuladorResposta.sucesso(res, garantia, 'Garantia encontrada com sucesso');
  }

  static async registrarPecaServico(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ManipuladorResposta.sucesso(
      res,
      await GarantiasService.registrarPecaServico(tenant_id, req.params.serviceId, req.body),
      'Peça do serviço registrada com garantia',
      201,
    );
  }
}
