import connection from '../../core/database/connection.js';
import type { CargoWriteDto } from './cargos.dto.js';

const projection = 'id, name, description, is_system, tenant_id, created_at, updated_at';

export default class CargosRepository {
  static async buscarSistemaPorNome(name: string) {
    const connect = await connection.connect();
    try { const result = await connect.query(`SELECT ${projection} FROM roles WHERE is_system = true AND name = $1 LIMIT 1`, [name]); return result.rows[0] || null; }
    finally { connect.release(); }
  }
  static async listar(tenantId: number) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `SELECT ${projection} FROM roles WHERE tenant_id IS NULL OR tenant_id = $1 ORDER BY is_system DESC, name`,
        [tenantId],
      );
      return result.rows;
    } finally { connect.release(); }
  }

  static async buscar(id: number, tenantId: number) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(`SELECT ${projection} FROM roles WHERE id = $1 AND (tenant_id IS NULL OR tenant_id = $2)`, [id, tenantId]);
      return result.rows[0] || null;
    } finally { connect.release(); }
  }

  static async criar(tenantId: number, data: CargoWriteDto) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `INSERT INTO roles (tenant_id, name, description, is_system) VALUES ($1, $2, $3, false) RETURNING ${projection}`,
        [tenantId, data.name.trim(), data.description?.trim() || null],
      );
      return result.rows[0];
    } finally { connect.release(); }
  }

  static async atualizar(id: number, tenantId: number, data: CargoWriteDto) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `UPDATE roles SET name = $1, description = $2, updated_at = NOW()
         WHERE id = $3 AND tenant_id = $4 AND is_system = false RETURNING ${projection}`,
        [data.name.trim(), data.description?.trim() || null, id, tenantId],
      );
      return result.rows[0] || null;
    } finally { connect.release(); }
  }

  static async remover(id: number, tenantId: number) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `DELETE FROM roles WHERE id = $1 AND tenant_id = $2 AND is_system = false RETURNING ${projection}`,
        [id, tenantId],
      );
      return result.rows[0] || null;
    } finally { connect.release(); }
  }
}
