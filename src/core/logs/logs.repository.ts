import connection from '../database/connection.js';
import { v4 as uuidv4 } from 'uuid';

class LogsRepository {
  static tableName = 'logs';

  static normalizeText(value: any, maxLength: number) {
    if (value === null || value === undefined) return null;

    const text = String(value).trim();
    if (!text) return null;

    return text.length > maxLength ? text.slice(0, maxLength) : text;
  }

  static async inserirLog(data: any) {
    const connect = await connection.connect();
    const id = uuidv4();
    const query = `
      INSERT INTO ${this.tableName} (id, tenant_id, user_id, method, url, status, response_time_ms, message)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const values = [
      id,
      data.tenant_id || null,
      data.user_id || null,
      this.normalizeText(data.method, 10),
      this.normalizeText(data.url, 255),
      data.status,
      data.response_time_ms || null,
      this.normalizeText(data.message, 255),
    ];
    try {
      await connect.query(query, values);
    } catch (e) {
      console.error('[LogsRepository] Erro ao persistir log', e);
    } finally {
      connect.release();
    }
  }

  static async obterLogsPaginados(tenant_id: any, page = 1, limit = 50) {
    const connect = await connection.connect();
    const offset = (page - 1) * limit;
    try {
      let queryLogs: string, queryCount: string, values: any[], countValues: any[];
      if (tenant_id) {
        queryLogs = `SELECT * FROM ${this.tableName} WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        values = [tenant_id, limit, offset];
        queryCount = `SELECT count(*) FROM ${this.tableName} WHERE tenant_id = $1`;
        countValues = [tenant_id];
      } else {
        queryLogs = `SELECT * FROM ${this.tableName} ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
        values = [limit, offset];
        queryCount = `SELECT count(*) FROM ${this.tableName}`;
        countValues = [];
      }
      const logsResult = await connect.query(queryLogs, values);
      const countResult = await connect.query(queryCount, countValues);
      return { data: logsResult.rows, total: parseInt(countResult.rows[0].count, 10) };
    } finally {
      connect.release();
    }
  }
}

export default LogsRepository;
