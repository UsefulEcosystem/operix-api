import connection from '../../database/connection.js';
import LocatarioModel from './locatarios.model.js';

class LocatariosRepository {
  static tableName = 'tenants';

  static async obterTodos() {
    const connect = await connection.connect();
    const result = await connect.query(`SELECT * FROM ${this.tableName}`);
    connect.release();
    return result.rows;
  }

  static async count() {
    const connect = await connection.connect();
    const result = await connect.query(`SELECT COUNT(*)::int AS total FROM ${this.tableName}`);
    connect.release();
    return result.rows[0]?.total || 0;
  }

  static async criar(tenant: LocatarioModel) {
    const connect = await connection.connect();
    const result = await connect.query(
      `INSERT INTO ${this.tableName}
       (name,cnpj,description,logo_url,plan_key,subscription_status,trial_started_at,trial_ends_at,enabled_modules)
       VALUES ($1, $2, $3, $4, COALESCE($5, 'trial'), COALESCE($6, 'trialing'), COALESCE($7, NOW()), COALESCE($8, NOW() + INTERVAL '30 days'), COALESCE($9, '[]'::jsonb))
       RETURNING *`,
      [
        tenant.name,
        tenant.cnpj || null,
        tenant.description || null,
        tenant.logo_url || null,
        tenant.plan_key || null,
        tenant.subscription_status || null,
        tenant.trial_started_at || null,
        tenant.trial_ends_at || null,
        JSON.stringify(tenant.enabled_modules || []),
      ],
    );
    connect.release();
    return result.rows[0];
  }

  static async atualizar(id: number, tenant: Partial<LocatarioModel>) {
    const connect = await connection.connect();
    const result = await connect.query(
      `UPDATE ${this.tableName}
       SET name = COALESCE($2, name),
           cnpj = $3,
           description = $4,
           logo_url = $5,
           enabled_modules = COALESCE($6, enabled_modules),
           updatedAt = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        tenant.name || null,
        tenant.cnpj ?? null,
        tenant.description ?? null,
        tenant.logo_url ?? null,
        tenant.enabled_modules ? JSON.stringify(tenant.enabled_modules) : null,
      ],
    );
    connect.release();
    return result.rows[0] || null;
  }

  static async remover(id: number) {
    const connect = await connection.connect();
    const result = await connect.query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
    connect.release();
    return result.rowCount;
  }

  static async findByName(name: string) {
    const connect = await connection.connect();
    const result = await connect.query(`SELECT * FROM ${this.tableName} WHERE LOWER(name) = LOWER($1)`, [name]);
    connect.release();
    return result.rows[0] || null;
  }

  static async findById(id: number) {
    const connect = await connection.connect();
    const result = await connect.query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
    connect.release();
    return result.rows[0] || null;
  }
}

export default LocatariosRepository;
