import ClientesRepository from './clientes.repository.js';
import type { ClientWriteDto } from './clientes.dto.js';

export default class ClientesService {
  static listar(tenantId: number) { return ClientesRepository.listar(tenantId); }
  static obterPorId(id: number, tenantId: number) { return ClientesRepository.obterPorId(id, tenantId); }
  static criar(tenantId: number, data: ClientWriteDto) { return ClientesRepository.criar(tenantId, data); }
  static atualizar(id: number, tenantId: number, data: ClientWriteDto) { return ClientesRepository.atualizar(id, tenantId, data); }
  static remover(id: number, tenantId: number) { return ClientesRepository.remover(id, tenantId); }
}
