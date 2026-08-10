import ErroValidacao from '../../core/utils/erro-validacao.js';
import AgendaRepository from './agenda.repository.js';
import connection from '../../core/database/connection.js';
import type { AgendaTaskWriteDto } from './agenda.dto.js';

export default class AgendaService {
  static listar(tenantId: number, from?: string, to?: string) { return AgendaRepository.listar(tenantId, from, to); }
  static async validarVinculos(tenantId: number, data: AgendaTaskWriteDto) {
    if (data.recurrence_rule && data.recurrence_rule !== 'none' && !data.recurrence_until) throw new ErroValidacao('Informe a data final da recorrência.', 422);
    if (data.service_id) {
      const c = await connection.connect();
      try { const r = await c.query('SELECT id FROM services WHERE id=$1 AND tenant_id=$2', [data.service_id, tenantId]); if (!r.rows[0]) throw new ErroValidacao('Serviço não encontrado nesta empresa.', 422); } finally { c.release(); }
    }
    if (data.sale_id) {
      const c = await connection.connect();
      try { const r = await c.query('SELECT id FROM sales WHERE id=$1 AND tenant_id=$2', [data.sale_id, tenantId]); if (!r.rows[0]) throw new ErroValidacao('Venda não encontrada nesta empresa.', 422); } finally { c.release(); }
    }
  }
  static async criar(tenantId: number, userId: number, data: AgendaTaskWriteDto) { await this.validarVinculos(tenantId, data); return AgendaRepository.criar(tenantId, userId, data); }
  static async atualizar(id: number, tenantId: number, data: AgendaTaskWriteDto) { await this.validarVinculos(tenantId, data); const r = await AgendaRepository.atualizar(id, tenantId, data); if (!r) throw new ErroValidacao('Lembrete não encontrado.', 404); return r; }
  static async remover(id: number, tenantId: number) { const r = await AgendaRepository.remover(id, tenantId); if (!r) throw new ErroValidacao('Lembrete não encontrado.', 404); return r; }
}
