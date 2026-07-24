import StatusPagamentoRepository from "./status-pagamento.repository.js";
import type { StatusPaymentCreateDto } from './status-pagamento.dto.js';

class StatusPagamentoService {
  static async obterTodos(tenantId: number) {
    return StatusPagamentoRepository.obterTodos(tenantId);
  }
  static async criar(tenantId: number, status: StatusPaymentCreateDto) {
    return StatusPagamentoRepository.criar(tenantId, status);
  }
  static async remover(id: number, tenantId: number) {
    return StatusPagamentoRepository.remover(id, tenantId);
  }
}

export default StatusPagamentoService;
