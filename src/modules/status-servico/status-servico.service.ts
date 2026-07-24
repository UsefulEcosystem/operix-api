import StatusServicoRepository from './status-servico.repository.js';
import type { StatusServiceCreateDto } from './status-servico.dto.js';

class StatusServicoService {
  static async obterTodos(tenantId: number) { return StatusServicoRepository.obterTodos(tenantId); }
  static async criar(tenantId: number, status: StatusServiceCreateDto) { return StatusServicoRepository.criar(tenantId, status); }
  static async remover(id: number, tenantId: number) { return StatusServicoRepository.remover(id, tenantId); }
}

export default StatusServicoService;
