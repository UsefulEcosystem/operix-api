import type { Request, Response } from 'express';
import ManipuladorResposta from '../../core/utils/manipulador-resposta.js';
import CargosService from './cargos.service.js';

export default class CargosController {
  static async listar(req: Request, res: Response) {
    return ManipuladorResposta.sucesso(res, await CargosService.listar((req as any).user.tenant_id), 'Cargos listados com sucesso');
  }
  static async criar(req: Request, res: Response) {
    return ManipuladorResposta.sucesso(res, await CargosService.criar((req as any).user.tenant_id, req.body), 'Cargo criado com sucesso', 201);
  }
  static async atualizar(req: Request, res: Response) {
    return ManipuladorResposta.sucesso(res, await CargosService.atualizar(Number(req.params.id), (req as any).user.tenant_id, req.body), 'Cargo atualizado com sucesso');
  }
  static async remover(req: Request, res: Response) {
    await CargosService.remover(Number(req.params.id), (req as any).user.tenant_id);
    return ManipuladorResposta.sucesso(res, null, 'Cargo removido com sucesso', 204);
  }
}
