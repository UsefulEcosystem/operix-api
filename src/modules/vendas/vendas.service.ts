// @ts-nocheck
import VendasRepository from './vendas.repository.js';
import type { SaleCreateDto } from './vendas.dto.js';
import UsuariosRepository from '../usuarios/usuarios.repository.js';
import ErroValidacao from '../../core/utils/erro-validacao.js';

export default class VendasService {
  static listar(tenantId: number) {
    return VendasRepository.listar(tenantId);
  }

  static obterPorId(id: number, tenantId: number) {
    return VendasRepository.obterPorId(id, tenantId);
  }

  static async criar(tenantId: number, data: SaleCreateDto) {
    if (!data.attendant_user_id || !(await UsuariosRepository.findByIdAndTenantId(data.attendant_user_id, tenantId))) {
      throw new ErroValidacao('Atendente não encontrado nesta empresa.', 422);
    }
    return VendasRepository.criar(tenantId, data);
  }
}
