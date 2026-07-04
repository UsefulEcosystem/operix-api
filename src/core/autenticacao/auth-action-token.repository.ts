import connection from '../database/connection.js';

type CreateAuthActionTokenInput = {
  userId: number;
  purpose: 'password_setup' | 'email_verification' | 'password_reset';
  tokenHash: string;
  expiresAt: Date;
};

export default class AuthActionTokenRepository {
  static tableName = 'auth_action_tokens';

  static async criar(input: CreateAuthActionTokenInput) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `INSERT INTO ${this.tableName}
         (user_id, purpose, token_hash, expires_at, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING *`,
        [input.userId, input.purpose, input.tokenHash, input.expiresAt],
      );
      return result.rows[0];
    } finally {
      connect.release();
    }
  }

  static async buscarAtivoPorHash(tokenHash: string, purpose: CreateAuthActionTokenInput['purpose']) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `SELECT * FROM ${this.tableName}
         WHERE token_hash = $1
           AND purpose = $2
           AND used_at IS NULL
           AND expires_at > NOW()
         LIMIT 1`,
        [tokenHash, purpose],
      );
      return result.rows[0] || null;
    } finally {
      connect.release();
    }
  }

  static async marcarUsado(id: number) {
    const connect = await connection.connect();
    try {
      await connect.query(
        `UPDATE ${this.tableName}
         SET used_at = NOW()
         WHERE id = $1 AND used_at IS NULL`,
        [id],
      );
    } finally {
      connect.release();
    }
  }

  static async revogarAtivosDoUsuario(userId: number, purpose: CreateAuthActionTokenInput['purpose']) {
    const connect = await connection.connect();
    try {
      await connect.query(
        `UPDATE ${this.tableName}
         SET used_at = NOW()
         WHERE user_id = $1 AND purpose = $2 AND used_at IS NULL`,
        [userId, purpose],
      );
    } finally {
      connect.release();
    }
  }
}
