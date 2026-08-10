import type { Request, Response } from 'express';
import ManipuladorResposta from '../../core/utils/manipulador-resposta.js';
import PontoService from './ponto.service.js';
import PontoRepository from './ponto.repository.js';
export default class PontoController {
  static async atual(req: Request, res: Response) { const u=(req as any).user; return ManipuladorResposta.sucesso(res, await PontoRepository.atual(u.tenant_id,u.id), 'Ponto atual'); }
  static async historico(req: Request, res: Response) { const u=(req as any).user; return ManipuladorResposta.sucesso(res, await PontoRepository.historico(u.tenant_id,u.id), 'Histórico de ponto'); }
  static async iniciar(req: Request, res: Response) { const u=(req as any).user; return ManipuladorResposta.sucesso(res, await PontoService.iniciar(u.tenant_id,u.id), 'Ponto iniciado', 201); }
  static async encerrar(req: Request, res: Response) { const u=(req as any).user; return ManipuladorResposta.sucesso(res, await PontoService.encerrar(u.tenant_id,u.id,req.body.notes), 'Ponto encerrado'); }
  static async solicitar(req: Request, res: Response) { const u=(req as any).user; return ManipuladorResposta.sucesso(res, await PontoService.solicitar(u.tenant_id,u.id,{...req.body,time_entry_id:Number(req.params.id)}), 'Solicitação enviada', 201); }
  static async gerenciar(req: Request, res: Response) { return ManipuladorResposta.sucesso(res, await PontoRepository.gerenciar((req as any).user.tenant_id, req.query.status as string), 'Lançamentos listados'); }
  static async ajustes(req: Request, res: Response) { return ManipuladorResposta.sucesso(res, await PontoRepository.ajustes((req as any).user.tenant_id), 'Solicitações listadas'); }
  static async revisar(req: Request, res: Response) { const u=(req as any).user; return ManipuladorResposta.sucesso(res, await PontoRepository.revisar(Number(req.params.id),u.tenant_id,u.id,req.body.status), 'Solicitação revisada'); }
}
