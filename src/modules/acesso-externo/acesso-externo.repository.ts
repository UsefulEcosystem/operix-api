import crypto from 'node:crypto';
import connection from '../../core/database/connection.js';
import { env } from '../../core/config/env.js';

export default class AcessoExternoRepository {
  static hash(token: string) { return crypto.createHash('sha256').update(token).digest('hex'); }
  static encrypt(token: string) { const iv = crypto.randomBytes(12); const cipher = crypto.createCipheriv('aes-256-gcm', crypto.createHash('sha256').update(env.jwtSecret).digest(), iv); const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]); return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${encrypted.toString('base64url')}`; }
  static decrypt(value: string) { const parts = value.split('.'); if (parts.length !== 3 || parts.some((part) => !part)) throw new Error('Token externo cifrado inválido.'); const [iv, tag, encrypted] = parts as [string, string, string]; const decipher = crypto.createDecipheriv('aes-256-gcm', crypto.createHash('sha256').update(env.jwtSecret).digest(), Buffer.from(iv, 'base64url')); decipher.setAuthTag(Buffer.from(tag, 'base64url')); return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64url')), decipher.final()]).toString('utf8'); }

  static async rotacionar(userId: number, tenantId: number) {
    const token = crypto.randomBytes(32).toString('base64url');
    const hash = this.hash(token);
    const connect = await connection.connect();
    try {
      await connect.query('UPDATE external_access_tokens SET active = false, revoked_at = NOW() WHERE user_id = $1 AND tenant_id = $2 AND active = true', [userId, tenantId]);
      await connect.query('UPDATE users SET external_access_version = external_access_version + 1 WHERE id = $1 AND tenant_id = $2', [userId, tenantId]);
      const result = await connect.query(`INSERT INTO external_access_tokens (tenant_id, user_id, token_hash, token_prefix, token_ciphertext) VALUES ($1, $2, $3, $4, $5) RETURNING id, token_prefix, created_at`, [tenantId, userId, hash, token.slice(0, 8), this.encrypt(token)]);
      return { ...result.rows[0], token };
    } finally { connect.release(); }
  }

  static async buscarAtual(userId: number, tenantId: number) {
    const connect = await connection.connect();
    try { const result = await connect.query('SELECT * FROM external_access_tokens WHERE user_id=$1 AND tenant_id=$2 AND active=true ORDER BY created_at DESC LIMIT 1', [userId, tenantId]); const row = result.rows[0]; return row ? { ...row, token: row.token_ciphertext ? this.decrypt(row.token_ciphertext) : null } : null; } finally { connect.release(); }
  }

  static async buscarAtivo(token: string) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(`SELECT eat.*, u.name, u.username, u.active AS user_active, u.external_access_version FROM external_access_tokens eat JOIN users u ON u.id = eat.user_id AND u.tenant_id = eat.tenant_id WHERE eat.token_hash = $1 AND eat.active = true`, [this.hash(token)]);
      if (result.rows[0]) await connect.query('UPDATE external_access_tokens SET last_used_at = NOW() WHERE id = $1', [result.rows[0].id]);
      return result.rows[0] || null;
    } finally { connect.release(); }
  }

  static async revogar(userId: number, tenantId: number) {
    const connect = await connection.connect();
    try {
      await connect.query('UPDATE external_access_tokens SET active = false, revoked_at = NOW() WHERE user_id = $1 AND tenant_id = $2 AND active = true', [userId, tenantId]);
      await connect.query('UPDATE users SET external_access_version = external_access_version + 1 WHERE id = $1 AND tenant_id = $2', [userId, tenantId]);
    } finally { connect.release(); }
  }
}
