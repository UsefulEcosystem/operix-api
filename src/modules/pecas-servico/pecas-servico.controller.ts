import type { Request, Response } from 'express';
import ManipuladorResposta from '../../core/utils/manipulador-resposta.js';
import PecasServicoService from './pecas-servico.service.js';

export default class PecasServicoController {
  static async listar(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const parts = await PecasServicoService.listar(tenant_id, Number(req.params.serviceId));
    return ManipuladorResposta.sucesso(res, parts, 'Peças do serviço listadas com sucesso');
  }

  static async registrar(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const part = await PecasServicoService.registrar(tenant_id, Number(req.params.serviceId), req.body);
    return ManipuladorResposta.sucesso(res, part, 'Peça do serviço registrada com sucesso', 201);
  }

  static async remover(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const part = await PecasServicoService.remover(tenant_id, Number(req.params.serviceId), Number(req.params.partId));
    return ManipuladorResposta.sucesso(res, part, 'Peça do serviço removida com sucesso');
  }
}
