import connection from '../../core/database/connection.js';
import type { AgendaTaskWriteDto } from './agenda.dto.js';

const projection = `a.id, CONCAT(a.id, '-', occurrences.occurrence_at::date) AS occurrence_key, a.title, a.description, occurrences.occurrence_at AS starts_at, a.ends_at, a.completed, a.color, a.service_id, a.sale_id, a.recurrence_rule, a.recurrence_until,
  a.notified_at, a.created_at, a.updated_at, s.order_of_service, s.client AS service_client,
  v.customer_name AS sale_customer_name`;

export default class AgendaRepository {
  static async listar(tenantId: number, from?: string, to?: string) {
    const c = await connection.connect();
    try {
      const result = await c.query(
        `SELECT ${projection} FROM agenda_tasks a
         LEFT JOIN services s ON s.id = a.service_id AND s.tenant_id = a.tenant_id
         LEFT JOIN sales v ON v.id = a.sale_id AND v.tenant_id = a.tenant_id
         CROSS JOIN LATERAL generate_series(
           a.starts_at,
           CASE WHEN a.recurrence_rule = 'none' THEN a.starts_at ELSE COALESCE(a.recurrence_until::timestamptz + INTERVAL '1 day' - INTERVAL '1 second', a.starts_at) END,
           CASE a.recurrence_rule WHEN 'daily' THEN INTERVAL '1 day' WHEN 'weekly' THEN INTERVAL '1 week' WHEN 'monthly' THEN INTERVAL '1 month' ELSE INTERVAL '1 day' END
         ) AS occurrences(occurrence_at)
         WHERE a.tenant_id = $1
           AND ($2::timestamptz IS NULL OR occurrences.occurrence_at >= $2::timestamptz)
           AND ($3::timestamptz IS NULL OR occurrences.occurrence_at < $3::timestamptz)
         ORDER BY occurrences.occurrence_at, a.id`, [tenantId, from || null, to || null]);
      return result.rows;
    } finally { c.release(); }
  }

  static async buscar(id: number, tenantId: number) {
    const rows = await this.listar(tenantId);
    return rows.find((row) => row.id === id) || null;
  }

  static async criar(tenantId: number, userId: number, data: AgendaTaskWriteDto) {
    const c = await connection.connect();
    try {
      const result = await c.query(
        `INSERT INTO agenda_tasks (tenant_id, user_id, title, description, starts_at, ends_at, completed, color, service_id, sale_id, recurrence_rule, recurrence_until)
         VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7,false),COALESCE($8,'#3B82F6'),$9,$10,COALESCE($11,'none'),$12) RETURNING id`,
        [tenantId, userId, data.title.trim(), data.description?.trim() || null, data.starts_at, data.ends_at || null, data.completed || false, data.color || '#3B82F6', data.service_id || null, data.sale_id || null, data.recurrence_rule || 'none', data.recurrence_until || null]);
      return this.buscar(result.rows[0].id, tenantId);
    } finally { c.release(); }
  }

  static async atualizar(id: number, tenantId: number, data: AgendaTaskWriteDto) {
    const c = await connection.connect();
    try {
      const result = await c.query(
        `UPDATE agenda_tasks SET title=$1, description=$2, starts_at=$3, ends_at=$4, completed=COALESCE($5, completed), color=COALESCE($6, color), service_id=$7, sale_id=$8, recurrence_rule=COALESCE($9, recurrence_rule), recurrence_until=$10, updated_at=NOW()
         WHERE id=$11 AND tenant_id=$12 RETURNING id`,
        [data.title.trim(), data.description?.trim() || null, data.starts_at, data.ends_at || null, data.completed ?? null, data.color || '#3B82F6', data.service_id || null, data.sale_id || null, data.recurrence_rule || 'none', data.recurrence_until || null, id, tenantId]);
      return result.rows[0] ? this.buscar(id, tenantId) : null;
    } finally { c.release(); }
  }

  static async remover(id: number, tenantId: number) {
    const c = await connection.connect();
    try { const result = await c.query('DELETE FROM agenda_tasks WHERE id=$1 AND tenant_id=$2 RETURNING id', [id, tenantId]); return result.rows[0] || null; }
    finally { c.release(); }
  }
}
