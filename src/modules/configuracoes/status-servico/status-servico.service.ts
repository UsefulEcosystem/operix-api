// @ts-nocheck
import StatusServicoRepository from './status-servico.repository.ts';

class StatusServicoService {
  static async obterTodos(tenant_id) { return StatusServicoRepository.obterTodos(tenant_id); }
  static async criar(status) { return StatusServicoRepository.criar(status); }
  static async remover(id, tenant_id) { return StatusServicoRepository.remover(id, tenant_id); }
}

export default StatusServicoService;
