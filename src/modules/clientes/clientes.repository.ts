import connection from '../../core/database/connection.js';
import type { ClientWriteDto } from './clientes.dto.js';

const projection = 'id, full_name, document, phone, address, created_at, updated_at';

export default class ClientesRepository {
  static async listar(tenantId: number) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `SELECT ${projection} FROM clients WHERE tenant_id = $1 ORDER BY full_name ASC, id ASC`,
        [tenantId],
      );
      return result.rows;
    } finally { connect.release(); }
  }

  static async obterPorId(id: number, tenantId: number) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `SELECT ${projection} FROM clients WHERE id = $1 AND tenant_id = $2`,
        [id, tenantId],
      );
      return result.rows[0] || null;
    } finally { connect.release(); }
  }

  static async criar(tenantId: number, data: ClientWriteDto) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `INSERT INTO clients (tenant_id, full_name, document, phone, address, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING ${projection}`,
        [tenantId, data.full_name, data.document || null, data.phone, data.address || null],
      );
      return result.rows[0];
    } finally { connect.release(); }
  }

  static async atualizar(id: number, tenantId: number, data: ClientWriteDto) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `UPDATE clients SET full_name = $1, document = $2, phone = $3, address = $4, updated_at = NOW()
         WHERE id = $5 AND tenant_id = $6 RETURNING ${projection}`,
        [data.full_name, data.document || null, data.phone, data.address || null, id, tenantId],
      );
      return result.rows[0] || null;
    } finally { connect.release(); }
  }

  static async remover(id: number, tenantId: number) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `DELETE FROM clients WHERE id = $1 AND tenant_id = $2 RETURNING ${projection}`,
        [id, tenantId],
      );
      return result.rows[0] || null;
    } finally { connect.release(); }
  }
}
