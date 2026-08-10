import connection from '../database/connection.js';
import { v4 as uuidv4 } from 'uuid';

export type AuditLogInput = {
  module: string;
  operation: string;
  user_id?: number | null;
  tenant_id?: number | null;
  json_dados?: Record<string, unknown> | null;
};

export default class AuditRepository {
  static async inserir(data: AuditLogInput) {
    const connect = await connection.connect();
    try {
      await connect.query(
        `INSERT INTO audit_logs (id, module, operation, user_id, tenant_id, json_dados)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuidv4(), data.module, data.operation, data.user_id || null, data.tenant_id || null, JSON.stringify(data.json_dados || {})],
      );
    } catch (error) {
      console.error('[AuditRepository] Erro ao persistir auditoria', error);
    } finally {
      connect.release();
    }
  }
}
