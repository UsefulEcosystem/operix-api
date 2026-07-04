// @ts-nocheck
import GarantiasRepository from './garantias.repository.js';

export default class GarantiasService {
  static listar(tenantId, filters = {}) {
    return GarantiasRepository.listar(tenantId, filters);
  }

  static obterPorId(id, tenantId) {
    return GarantiasRepository.obterPorId(id, tenantId);
  }

  static registrarPecaServico(tenantId, serviceId, data) {
    return GarantiasRepository.registrarPecaServico(tenantId, serviceId, data);
  }
}
