import connection from '../database/connection.js';

type CreateRefreshTokenInput = {
  userId: number;
  tokenHash: string;
  jti: string;
  expiresAt: Date;
  ip?: string | null | undefined;
  userAgent?: string | null | undefined;
};

export default class RefreshTokenRepository {
  static tableName = 'refresh_tokens';

  static async criar(input: CreateRefreshTokenInput) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `INSERT INTO ${this.tableName}
         (user_id, token_hash, jti, expires_at, ip, user_agent, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING *`,
        [input.userId, input.tokenHash, input.jti, input.expiresAt, input.ip || null, input.userAgent || null],
      );
      return result.rows[0];
    } finally {
      connect.release();
    }
  }

  static async buscarAtivoPorHash(tokenHash: string) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `SELECT * FROM ${this.tableName}
         WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()
         LIMIT 1`,
        [tokenHash],
      );
      return result.rows[0] || null;
    } finally {
      connect.release();
    }
  }

  static async buscarPorHash(tokenHash: string) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `SELECT * FROM ${this.tableName}
         WHERE token_hash = $1
         LIMIT 1`,
        [tokenHash],
      );
      return result.rows[0] || null;
    } finally {
      connect.release();
    }
  }

  static async revogar(id: number, replacedByTokenId?: number | null) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `UPDATE ${this.tableName}
         SET revoked_at = NOW(), replaced_by_token_id = COALESCE($2, replaced_by_token_id)
         WHERE id = $1 AND revoked_at IS NULL
         RETURNING *`,
        [id, replacedByTokenId || null],
      );
      return result.rows[0] || null;
    } finally {
      connect.release();
    }
  }

  static async revogarTodosDoUsuario(userId: number) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `UPDATE ${this.tableName}
         SET revoked_at = NOW()
         WHERE user_id = $1 AND revoked_at IS NULL`,
        [userId],
      );
      return result.rowCount || 0;
    } finally {
      connect.release();
    }
  }
}
