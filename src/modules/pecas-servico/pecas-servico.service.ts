import PecasServicoRepository from './pecas-servico.repository.js';
import type { ServicePartCreateDto } from './pecas-servico.dto.js';

export default class PecasServicoService {
  static listar(tenantId: number, serviceId: number) {
    return PecasServicoRepository.listar(tenantId, serviceId);
  }

  static registrar(tenantId: number, serviceId: number, data: ServicePartCreateDto) {
    return PecasServicoRepository.registrar(tenantId, serviceId, data);
  }

  static remover(tenantId: number, serviceId: number, partId: number) {
    return PecasServicoRepository.remover(tenantId, serviceId, partId);
  }
}
