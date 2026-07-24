import type { Request, Response } from 'express';
import NotificacoesService from './notificacoes.service.js';
import ManipuladorResposta from '../../core/utils/manipulador-resposta.js';

export default class NotificacoesController {
  static async listar(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    return ManipuladorResposta.sucesso(res, await NotificacoesService.listar(tenant_id), 'Notificações listadas com sucesso');
  }
}
