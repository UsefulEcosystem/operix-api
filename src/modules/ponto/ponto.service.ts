import ErroValidacao from '../../core/utils/erro-validacao.js';
import PontoRepository from './ponto.repository.js';
export default class PontoService {
  static async iniciar(tenantId: number, userId: number) { if (await PontoRepository.atual(tenantId, userId)) throw new ErroValidacao('Já existe um ponto aberto.', 422); return PontoRepository.iniciar(tenantId, userId, new Date().toISOString()); }
  static async encerrar(tenantId: number, userId: number, notes?: string) { const open = await PontoRepository.atual(tenantId, userId); if (!open) throw new ErroValidacao('Nenhum ponto aberto encontrado.', 422); return PontoRepository.encerrar(open.id, tenantId, userId, new Date().toISOString(), notes); }
  static async solicitar(tenantId: number, userId: number, data: any) { const result = await PontoRepository.solicitar(tenantId, userId, data); if (!result) throw new ErroValidacao('Lançamento não encontrado.', 404); return result; }
}
