import type { Request, Response } from 'express';
import ManipuladorResposta from '../../core/utils/manipulador-resposta.js';
import PecasServicoService from './pecas-servico.service.js';

export default class PecasServicoController {
  static async registrar(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const part = await PecasServicoService.registrar(tenant_id, Number(req.params.serviceId), req.body);
    return ManipuladorResposta.sucesso(res, part, 'Peça do serviço registrada com sucesso', 201);
  }
}
