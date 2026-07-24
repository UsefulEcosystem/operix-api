import connection from '../database/connection.js';

type SubstituicaoPermissaoInput = {
  permission_key: string;
  effect: 'allow' | 'deny';
};

class PermissoesRepository {
  static tableName = 'user_permission_overrides';

  static async getOverridesByUserId(userId: number) {
    const connect = await connection.connect();

    try {
      const result = await connect.query(
        `SELECT permission_key, effect FROM ${this.tableName} WHERE user_id = $1 ORDER BY permission_key`,
        [userId],
      );

      return result.rows as SubstituicaoPermissaoInput[];
    } finally {
      connect.release();
    }
  }

  static async replaceOverrides(userId: number, overrides: SubstituicaoPermissaoInput[]) {
    const connect = await connection.connect();

    try {
      await connect.query('BEGIN');
      await connect.query(`DELETE FROM ${this.tableName} WHERE user_id = $1`, [userId]);

      for (const override of overrides) {
        await connect.query(
          `INSERT INTO ${this.tableName} (user_id, permission_key, effect, created_at, updated_at)
           VALUES ($1, $2, $3, NOW(), NOW())`,
          [userId, override.permission_key, override.effect],
        );
      }

      await connect.query('COMMIT');
      return overrides;
    } catch (error) {
      await connect.query('ROLLBACK');
      throw error;
    } finally {
      connect.release();
    }
  }
}

export default PermissoesRepository;
