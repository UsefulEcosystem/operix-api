// @ts-nocheck
import connection from '../../../core/database/connection.js';

class StatusPagamentoRepository {
  static async obterTodos(tenant_id) {
    const connect = await connection.connect();
    const result = await connect.query(
      "SELECT * FROM status_payment WHERE tenant_id = $1",
      [tenant_id],
    );
    connect.release();
    return result.rows;
  }

  static async obterUm(tenant_id, id) {
    const connect = await connection.connect();
    const result = await connect.query(
      "SELECT * FROM status_payment WHERE tenant_id = $1 AND id = $2",
      [tenant_id, id],
    );
    connect.release();
    return result.rows;
  }

  static async obterStatusDefault(tenant_id) {
    const connect = await connection.connect();
    const result = await connect.query(
      "SELECT * FROM status_payment WHERE tenant_id = $1 AND is_default = $2",
      [tenant_id, true],
    );
    connect.release();
    return result.rows;
  }

  static async criar(status_payment) {
    const { tenant_id, description, color, is_default } = status_payment;
    const connect = await connection.connect();
    const created = await connect.query(
      "INSERT INTO status_payment (tenant_id, description, color, is_default) VALUES ($1, $2, $3, $4)",
      [tenant_id, description, color, is_default],
    );
    connect.release();
    return created.rowCount;
  }

  static async remover(id, tenant_id) {
    const connect = await connection.connect();
    const removed = await connect.query(
      "DELETE FROM status_payment WHERE id = $1 AND tenant_id = $2",
      [id, tenant_id],
    );
    connect.release();
    return removed.rowCount;
  }
}

export default StatusPagamentoRepository;
