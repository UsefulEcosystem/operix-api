import type { Request, Response } from 'express';
import ServicosService from './servicos.service.js';
import ManipuladorResposta from '../../core/utils/manipulador-resposta.js';
import MensageriaService from '../../core/utils/mensageria.service.js';

export default class ServicosController {
  static async obterTodos(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const services = await ServicosService.obterTodos(tenant_id);
    return ManipuladorResposta.sucesso(res, services, 'Serviços listados com sucesso');
  }

  static async criar(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const created = await ServicosService.criar(tenant_id, req.body);
    MensageriaService.notificarLocatario(tenant_id, '@service/created', created);
    return ManipuladorResposta.sucesso(res, created, 'Serviço criado com sucesso', 201);
  }

  static async atualizarInfoCliente(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const { id } = req.params;
    const result = await ServicosService.atualizarInfoCliente(id, tenant_id, req.body);
    return ManipuladorResposta.sucesso(res, result, 'Informações do cliente atualizadas com sucesso');
  }

  static async atualizarStatusServico(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const { id } = req.params;
    const { status_id } = req.body;
    const result = await ServicosService.atualizarStatusServico(id, tenant_id, status_id);
    MensageriaService.notificarLocatario(tenant_id, '@service/status_updated', { id, status_id, result });
    return ManipuladorResposta.sucesso(res, result, 'Status do serviço atualizado com sucesso');
  }

  static async atualizarStatusPagamento(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const { id } = req.params;
    const { payment_status_id } = req.body;
    const result = await ServicosService.atualizarStatusPagamento(id, tenant_id, payment_status_id);
    MensageriaService.notificarLocatario(tenant_id, '@service/payment_updated', { id, payment_status_id, result });
    return ManipuladorResposta.sucesso(res, result, 'Status do pagamento atualizado com sucesso');
  }

  static async remover(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const { id, cod } = req.params;
    const result = await ServicosService.remover(id, tenant_id, cod);
    return ManipuladorResposta.sucesso(res, result, 'Serviço removido com sucesso', 204);
  }
}
