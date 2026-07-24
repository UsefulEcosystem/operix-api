import PecasServicoRepository from './pecas-servico.repository.js';
import type { ServicePartCreateDto } from './pecas-servico.dto.js';

export default class PecasServicoService {
  static registrar(tenantId: number, serviceId: number, data: ServicePartCreateDto) {
    return PecasServicoRepository.registrar(tenantId, serviceId, data);
  }
}
