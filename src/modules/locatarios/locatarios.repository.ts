import crypto from 'node:crypto';
import connection from '../../core/database/connection.js';
import LocatarioModel from './locatarios.model.js';

const ACCESS_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateAccessCode() {
  const bytes = crypto.randomBytes(8);
  const value = Array.from(bytes, (byte) => ACCESS_CODE_ALPHABET[byte % ACCESS_CODE_ALPHABET.length]).join('');
  return `OPE-${value.slice(0, 4)}-${value.slice(4)}`;
}

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
    try {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          const result = await connect.query(
            `INSERT INTO ${this.tableName}
             (name,access_code,cnpj,description,logo_url,plan_key,subscription_status,trial_started_at,trial_ends_at,enabled_modules)
             VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'trial'), COALESCE($7, 'trialing'), COALESCE($8, NOW()), COALESCE($9, NOW() + INTERVAL '30 days'), COALESCE($10, '[]'::jsonb))
             RETURNING *`,
            [
              tenant.name,
              generateAccessCode(),
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
          return result.rows[0];
        } catch (error: any) {
          if (error?.code !== '23505' || error?.constraint !== 'tenants_access_code_unique') {
            throw error;
          }
        }
      }
      throw new Error('Não foi possível gerar um código de acesso único para a empresa.');
    } finally {
      connect.release();
    }
  }

  static async atualizar(id: number, tenant: Partial<LocatarioModel>) {
    const has = (key: keyof LocatarioModel) => Object.prototype.hasOwnProperty.call(tenant, key);
    const connect = await connection.connect();
    const result = await connect.query(
      `UPDATE ${this.tableName}
       SET name = CASE WHEN $7 THEN $2 ELSE name END,
           cnpj = CASE WHEN $8 THEN $3 ELSE cnpj END,
           description = CASE WHEN $9 THEN $4 ELSE description END,
           logo_url = CASE WHEN $10 THEN $5 ELSE logo_url END,
           enabled_modules = CASE WHEN $11 THEN $6 ELSE enabled_modules END,
           "updatedAt" = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        tenant.name ?? null,
        tenant.cnpj ?? null,
        tenant.description ?? null,
        tenant.logo_url ?? null,
        tenant.enabled_modules ? JSON.stringify(tenant.enabled_modules) : null,
        has('name'),
        has('cnpj'),
        has('description'),
        has('logo_url'),
        has('enabled_modules'),
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

  static async findByAccessCode(accessCode: string) {
    const connect = await connection.connect();
    const result = await connect.query(
      `SELECT * FROM ${this.tableName} WHERE access_code = $1`,
      [accessCode],
    );
    connect.release();
    return result.rows[0] || null;
  }
}

export default LocatariosRepository;
