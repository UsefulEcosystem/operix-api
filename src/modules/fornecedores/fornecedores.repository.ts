import connection from '../../core/database/connection.js';
import type { FornecedorWriteDto } from './fornecedores.dto.js';

const projection = 'id, name, cnpj, phone, address, tenant_id, created_at, updated_at';
export default class FornecedoresRepository {
  static async listar(tenantId: number) { const c = await connection.connect(); try { const r = await c.query(`SELECT ${projection} FROM suppliers WHERE tenant_id = $1 ORDER BY name`, [tenantId]); return r.rows; } finally { c.release(); } }
  static async criar(tenantId: number, d: FornecedorWriteDto) { const c = await connection.connect(); try { const r = await c.query(`INSERT INTO suppliers (tenant_id, name, cnpj, phone, address) VALUES ($1,$2,$3,$4,$5) RETURNING ${projection}`, [tenantId, d.name.trim(), d.cnpj?.trim() || null, d.phone?.trim() || null, d.address?.trim() || null]); return r.rows[0]; } finally { c.release(); } }
  static async atualizar(id: number, tenantId: number, d: FornecedorWriteDto) { const c = await connection.connect(); try { const r = await c.query(`UPDATE suppliers SET name=$1, cnpj=$2, phone=$3, address=$4, updated_at=NOW() WHERE id=$5 AND tenant_id=$6 RETURNING ${projection}`, [d.name.trim(), d.cnpj?.trim() || null, d.phone?.trim() || null, d.address?.trim() || null, id, tenantId]); return r.rows[0] || null; } finally { c.release(); } }
  static async remover(id: number, tenantId: number) { const c = await connection.connect(); try { const r = await c.query(`DELETE FROM suppliers WHERE id=$1 AND tenant_id=$2 RETURNING ${projection}`, [id, tenantId]); return r.rows[0] || null; } finally { c.release(); } }
}
