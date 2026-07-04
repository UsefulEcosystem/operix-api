import connection from '../database/connection.js';

export default class AccessTokenBlacklistRepository {
  static tableName = 'access_token_blacklist';

  static async adicionar(jti: string, expiresAt: Date, userId?: number | null) {
    const connect = await connection.connect();
    try {
      await connect.query(
        `INSERT INTO ${this.tableName} (jti, user_id, expires_at, created_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (jti) DO NOTHING`,
        [jti, userId || null, expiresAt],
      );
    } finally {
      connect.release();
    }
  }

  static async existe(jti: string) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `SELECT 1 FROM ${this.tableName}
         WHERE jti = $1 AND expires_at > NOW()
         LIMIT 1`,
        [jti],
      );
      return Boolean(result.rows[0]);
    } finally {
      connect.release();
    }
  }
}
