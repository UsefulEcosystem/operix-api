// @ts-nocheck
import StatusPagamentoRepository from "./status-pagamento.repository.js";

class StatusPagamentoService {
  static async obterTodos(tenant_id) {
    return StatusPagamentoRepository.obterTodos(tenant_id);
  }
  static async criar(status) {
    return StatusPagamentoRepository.criar(status);
  }
  static async remover(id, tenant_id) {
    return StatusPagamentoRepository.remover(id, tenant_id);
  }
}

export default StatusPagamentoService;
