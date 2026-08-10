import type { Request, Response } from 'express';
import ManipuladorResposta from '../../core/utils/manipulador-resposta.js';
import AcessoExternoService from './acesso-externo.service.js';

export default class AcessoExternoController {
  static async meuLink(req: Request, res: Response) { return ManipuladorResposta.sucesso(res, await AcessoExternoService.meuLink((req as any).user.id, (req as any).user.tenant_id), 'Link externo carregado'); }
  static async rotacionarMeuLink(req: Request, res: Response) { return ManipuladorResposta.sucesso(res, await AcessoExternoService.criarLink((req as any).user.id, (req as any).user.tenant_id), 'Link externo rotacionado'); }
  static async trocar(req: Request, res: Response) { return ManipuladorResposta.sucesso(res, await AcessoExternoService.trocar(req.body.token), 'Acesso externo autorizado'); }
  static async criarLink(req: Request, res: Response) { return ManipuladorResposta.sucesso(res, await AcessoExternoService.criarLink(Number(req.params.id), (req as any).user.tenant_id), 'Link externo criado'); }
}
