// @ts-nocheck
import VendasRepository from './vendas.repository.js';
import type { SaleCreateDto } from './vendas.dto.js';

export default class VendasService {
  static listar(tenantId: number) {
    return VendasRepository.listar(tenantId);
  }

  static obterPorId(id: number, tenantId: number) {
    return VendasRepository.obterPorId(id, tenantId);
  }

  static criar(tenantId: number, data: SaleCreateDto) {
    return VendasRepository.criar(tenantId, data);
  }
}
