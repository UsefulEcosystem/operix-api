import type { Request, Response } from 'express';
import OrdemServicoService from './ordem-servico.service.js';
import Utilitarios from '../../core/utils/utilitarios.js';
import ManipuladorResposta from '../../core/utils/manipulador-resposta.js';

export default class OrdemServicoController {
  static async obterTodos(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const orders = await OrdemServicoService.obterTodos(tenant_id);
    return ManipuladorResposta.sucesso(res, orders, 'Ordens de serviço listadas com sucesso');
  }

  static async obterUnico(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const { cod } = req.params;
    const order = await OrdemServicoService.obterUnico(cod, tenant_id);
    return ManipuladorResposta.sucesso(res, order, 'Ordem de serviço detalhada com sucesso');
  }

  static async atualizarOrcamento(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const { cod } = req.params;

    if (req.body.type === 'completa') {
      const getOrderValue = await OrdemServicoService.obterUnico(cod, tenant_id);
      const id = Utilitarios.gerarUuid();
      const estimateArray = JSON.parse(getOrderValue[0].estimate) || [];
      estimateArray.push({ id, amount: req.body.amount, description: req.body.description, price: req.body.price });
      let totalPrice = 0;
      for (const record of estimateArray) totalPrice += record.price;
      const updated = await OrdemServicoService.atualizarOrcamento(JSON.stringify(estimateArray), totalPrice, cod, tenant_id);
      return ManipuladorResposta.sucesso(res, updated, 'Orçamento atualizado com sucesso');
    } else {
      const removed = await OrdemServicoService.removerOrcamentoSimple(cod, tenant_id);
      if (removed) {
        const getOrderValue = await OrdemServicoService.obterUnico(cod, tenant_id);
        const id = Utilitarios.gerarUuid();
        const estimateArray = JSON.parse(getOrderValue[0].estimate) || [];
        estimateArray.push({ id, amount: req.body.amount, description: req.body.description, price: req.body.price });
        let totalPrice = 0;
        for (const record of estimateArray) totalPrice += record.price;
        const updated = await OrdemServicoService.atualizarOrcamento(JSON.stringify(estimateArray), totalPrice, cod, tenant_id);
        return ManipuladorResposta.sucesso(res, updated, 'Orçamento simplificado atualizado com sucesso');
      }
      return ManipuladorResposta.erro(res, 'Erro ao atualizar orçamento simplificado', 422);
    }
  }

  static async removerOrcamento(req: Request, res: Response) {
    const { tenant_id } = (req as any).user;
    const { cod, idEstimate } = req.params;
    const result = await OrdemServicoService.removerOrcamento(cod, tenant_id, idEstimate);
    return ManipuladorResposta.sucesso(res, result, 'Orçamento removido com sucesso', 204);
  }
}
