import connection from '../../core/database/connection.js';
import type { StatusServiceCreateDto } from './status-servico.dto.js';

export default class StatusServicoRepository {
  static async obterTodos(tenantId: number) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        'SELECT id, description, color FROM status_service WHERE tenant_id = $1 ORDER BY id',
        [tenantId],
      );
      return result.rows;
    } finally {
      connect.release();
    }
  }

  static async criar(tenantId: number, status: StatusServiceCreateDto) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        'INSERT INTO status_service (tenant_id, description, color) VALUES ($1, $2, $3) RETURNING id, description, color',
        [tenantId, status.description, status.color || null],
      );
      return result.rows[0];
    } finally {
      connect.release();
    }
  }

  static async remover(id: number, tenantId: number) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        'DELETE FROM status_service WHERE id = $1 AND tenant_id = $2 RETURNING id, description, color',
        [id, tenantId],
      );
      return result.rows[0];
    } finally {
      connect.release();
    }
  }
}
