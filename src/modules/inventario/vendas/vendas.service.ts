// @ts-nocheck
import VendasRepository from './vendas.repository.js';

export default class VendasService {
  static listar(tenantId) {
    return VendasRepository.listar(tenantId);
  }

  static obterPorId(id, tenantId) {
    return VendasRepository.obterPorId(id, tenantId);
  }

  static criar(tenantId, data) {
    return VendasRepository.criar(tenantId, data);
  }
}
