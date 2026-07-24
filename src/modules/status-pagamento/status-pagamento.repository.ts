import connection from '../../core/database/connection.js';
import type { StatusPaymentCreateDto } from './status-pagamento.dto.js';

export default class StatusPagamentoRepository {
  static async obterTodos(tenantId: number) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        'SELECT id, description, color, is_default AS default FROM status_payment WHERE tenant_id = $1 ORDER BY id',
        [tenantId],
      );
      return result.rows;
    } finally {
      connect.release();
    }
  }

  static async obterUm(tenantId: number, id: number) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        'SELECT id, description, color, is_default AS default FROM status_payment WHERE tenant_id = $1 AND id = $2',
        [tenantId, id],
      );
      return result.rows;
    } finally {
      connect.release();
    }
  }

  static async obterStatusDefault(tenantId: number) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        'SELECT id, description, color, is_default AS default FROM status_payment WHERE tenant_id = $1 AND is_default = true',
        [tenantId],
      );
      return result.rows;
    } finally {
      connect.release();
    }
  }

  static async criar(tenantId: number, status: StatusPaymentCreateDto) {
    const connect = await connection.connect();
    try {
      await connect.query('BEGIN');
      if (status.default) {
        await connect.query('UPDATE status_payment SET is_default = false WHERE tenant_id = $1', [tenantId]);
      }
      const result = await connect.query(
        `INSERT INTO status_payment (tenant_id, description, color, is_default)
         VALUES ($1, $2, $3, $4)
         RETURNING id, description, color, is_default AS default`,
        [tenantId, status.description, status.color, status.default],
      );
      await connect.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await connect.query('ROLLBACK');
      throw error;
    } finally {
      connect.release();
    }
  }

  static async remover(id: number, tenantId: number) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `DELETE FROM status_payment WHERE id = $1 AND tenant_id = $2
         RETURNING id, description, color, is_default AS default`,
        [id, tenantId],
      );
      return result.rows[0];
    } finally {
      connect.release();
    }
  }
}
