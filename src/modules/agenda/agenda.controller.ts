import type { Request, Response } from 'express';
import ManipuladorResposta from '../../core/utils/manipulador-resposta.js';
import AgendaService from './agenda.service.js';
import ErroValidacao from '../../core/utils/erro-validacao.js';
import PermissoesService from '../../core/permissoes/permissoes.service.js';

function validateLinks(req: Request) {
  const permissions = (req as any).user.permissions || [];
  const data = (req as any).body || {};
  if (data.service_id && !PermissoesService.temPermissao('servicos.acesso', permissions)) throw new ErroValidacao('Você não possui acesso ao módulo de serviços.', 403);
  if (data.sale_id && !PermissoesService.temPermissao('vendas.acesso', permissions)) throw new ErroValidacao('Você não possui acesso ao módulo de vendas.', 403);
}
export default class AgendaController {
  static async listar(req: Request, res: Response) {
    const user = (req as any).user;
    const permissions = user.permissions || [];
    const query = (req.query || {}) as any;
    const tasks = await AgendaService.listar(user.tenant_id, query.from as string, query.to as string);
    const data = tasks.map((task: any) => ({ ...task, ...(PermissoesService.temPermissao('servicos.acesso', permissions) ? {} : { service_id: null, order_of_service: null, service_client: null }), ...(PermissoesService.temPermissao('vendas.acesso', permissions) ? {} : { sale_id: null, sale_customer_name: null }) }));
    return ManipuladorResposta.sucesso(res, data, 'Agenda listada com sucesso');
  }
  static async criar(req: Request, res: Response) { validateLinks(req); return ManipuladorResposta.sucesso(res, await AgendaService.criar((req as any).user.tenant_id, (req as any).user.id, req.body), 'Lembrete criado com sucesso', 201); }
  static async atualizar(req: Request, res: Response) { validateLinks(req); return ManipuladorResposta.sucesso(res, await AgendaService.atualizar(Number(req.params.id), (req as any).user.tenant_id, req.body), 'Lembrete atualizado com sucesso'); }
  static async remover(req: Request, res: Response) { await AgendaService.remover(Number(req.params.id), (req as any).user.tenant_id); return ManipuladorResposta.sucesso(res, null, 'Lembrete removido com sucesso', 204); }
}
