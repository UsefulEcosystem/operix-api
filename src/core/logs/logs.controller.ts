import type { Request, Response } from 'express';
import LogsService from './logs.service.js';
import ManipuladorResposta from '../utils/manipulador-resposta.js';

export default class LogsController {
  static async obterLogsPaginados(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = await LogsService.obterLogsPaginados(tenant_id, page, limit);
    return ManipuladorResposta.sucesso(res, logs, 'Logs listados com sucesso');
  }
}
