// @ts-nocheck
import OrdemServicoRepository from './ordem-servico.repository.js';
import ErroValidacao from '../../core/utils/erro-validacao.js';

class OrdemServicoService {
  static async obterTodos(tenant_id) { return OrdemServicoRepository.obterTodos(tenant_id); }

  static async obterUnico(cod, tenant_id) {
    const order = await OrdemServicoRepository.obterUnico(cod, tenant_id);
    if (!order || order.length === 0) throw new ErroValidacao('Ordem de serviço não encontrada', 404);
    return order;
  }

  static async atualizarOrcamento(estimateArray, totalPrice, cod, tenant_id, warrantyDays) { return OrdemServicoRepository.atualizarOrcamento(estimateArray, totalPrice, cod, tenant_id, warrantyDays); }
  static async atualizarGarantia(cod, tenant_id, warrantyDays) { return OrdemServicoRepository.atualizarGarantia(cod, tenant_id, warrantyDays); }
  static async removerOrcamento(cod, tenant_id, idEstimate) { return OrdemServicoRepository.removerOrcamento(cod, tenant_id, idEstimate); }
  static async removerOrcamentoSimple(cod, tenant_id) { return OrdemServicoRepository.removerOrcamentoSimple(cod, tenant_id); }
}

export default OrdemServicoService;
