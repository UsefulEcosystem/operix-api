import type { Request, Response } from 'express';
import ClientesService from './clientes.service.js';
import ManipuladorResposta from '../../core/utils/manipulador-resposta.js';

export default class ClientesController {
  static async listar(req: Request, res: Response) {
    return ManipuladorResposta.sucesso(res, await ClientesService.listar((req as any).user.tenant_id), 'Clientes listados com sucesso');
  }
  static async obterPorId(req: Request, res: Response) {
    return ManipuladorResposta.sucesso(res, await ClientesService.obterPorId(Number(req.params.id), (req as any).user.tenant_id), 'Cliente obtido com sucesso');
  }
  static async criar(req: Request, res: Response) {
    return ManipuladorResposta.sucesso(res, await ClientesService.criar((req as any).user.tenant_id, req.body), 'Cliente criado com sucesso', 201);
  }
  static async atualizar(req: Request, res: Response) {
    return ManipuladorResposta.sucesso(res, await ClientesService.atualizar(Number(req.params.id), (req as any).user.tenant_id, req.body), 'Cliente atualizado com sucesso');
  }
  static async remover(req: Request, res: Response) {
    return ManipuladorResposta.sucesso(res, await ClientesService.remover(Number(req.params.id), (req as any).user.tenant_id), 'Cliente removido com sucesso', 204);
  }
}
