import ErroValidacao from '../../core/utils/erro-validacao.js';
import CargosRepository from './cargos.repository.js';
import type { CargoWriteDto } from './cargos.dto.js';

export default class CargosService {
  static listar(tenantId: number) { return CargosRepository.listar(tenantId); }
  static criar(tenantId: number, data: CargoWriteDto) { return CargosRepository.criar(tenantId, data); }
  static async atualizar(id: number, tenantId: number, data: CargoWriteDto) {
    const result = await CargosRepository.atualizar(id, tenantId, data);
    if (!result) throw new ErroValidacao('Cargo não encontrado ou protegido.', 404);
    return result;
  }
  static async remover(id: number, tenantId: number) {
    const result = await CargosRepository.remover(id, tenantId);
    if (!result) throw new ErroValidacao('Cargo não encontrado ou protegido.', 422);
    return result;
  }
}
