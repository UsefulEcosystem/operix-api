import connection from '../../core/database/connection.js';
import UsuarioModel from './usuarios.model.js';

class UsuariosRepository {
  static async obterTodos(tenantId: number) {
    const connect = await connection.connect();
    const result = await connect.query(
      'SELECT id, name, username, email, tenant_id, admin, root, avatar_url, role_title, active, preferences FROM users WHERE tenant_id = $1 ORDER BY id',
      [tenantId],
    );
    connect.release();
    return result.rows;
  }

  static async getById(user: UsuarioModel, tenantId: number) {
    const connect = await connection.connect();
    const result = await connect.query('SELECT * FROM users WHERE id = $1 AND tenant_id = $2', [user.id, tenantId]);
    connect.release();
    return result.rows;
  }

  static async findByIdAndTenantId(id: number, tenantId: number) {
    const connect = await connection.connect();
    const result = await connect.query('SELECT * FROM users WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
    connect.release();
    return result.rows[0] || null;
  }

  static async remover(user: UsuarioModel, tenantId: number) {
    const connect = await connection.connect();
    const result = await connect.query('DELETE FROM users WHERE id = $1 AND tenant_id = $2', [user.id, tenantId]);
    connect.release();
    return result.rowCount;
  }

  static async criar(user: UsuarioModel) {
    const connect = await connection.connect();
    const result = await connect.query(
      `INSERT INTO users
       (tenant_id, name, username, email, password, root, admin, avatar_url, role_title, active, preferences, onboarding_completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10, true), COALESCE($11, '{}'::jsonb), CASE WHEN $6 THEN NULL ELSE NOW() END)
       RETURNING *`,
      [
        user.tenant_id,
        user.name,
        user.username,
        user.email,
        user.password,
        user.root,
        user.admin,
        user.avatar_url || null,
        user.role_title || null,
        user.active,
        JSON.stringify(user.preferences || {}),
      ],
    );
    connect.release();
    return result.rows[0];
  }

  static async completarOnboarding(id: number, data: Partial<UsuarioModel> & { tenant_id: number }) {
    const connect = await connection.connect();
    const result = await connect.query(
      `UPDATE users
       SET tenant_id = $2,
           name = $3,
           username = $4,
           root = true,
           admin = true,
           active = true,
           "updatedAt" = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, data.tenant_id, data.name, data.username],
    );
    connect.release();
    return result.rows[0] || null;
  }

  static async marcarEmailVerificado(id: number) {
    const connect = await connection.connect();
    const result = await connect.query(
      `UPDATE users
       SET email_verified_at = COALESCE(email_verified_at, NOW()),
           active = true,
           "updatedAt" = NOW()
       WHERE id = $1
       RETURNING *`,
      [id],
    );
    connect.release();
    return result.rows[0] || null;
  }

  static async atualizarSenha(id: number, passwordHash: string) {
    const connect = await connection.connect();
    const result = await connect.query(
      `UPDATE users
       SET password = $2,
           "updatedAt" = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, passwordHash],
    );
    connect.release();
    return result.rows[0] || null;
  }

  static async atualizarPerfil(id: number, tenantId: number, data: Partial<UsuarioModel>) {
    const connect = await connection.connect();
    const result = await connect.query(
      `UPDATE users
       SET name = COALESCE($3, name),
           avatar_url = $4,
           role_title = COALESCE($5, role_title),
           preferences = COALESCE($6, preferences),
           "updatedAt" = NOW()
       WHERE id = $1 AND tenant_id = $2
       RETURNING id, name, username, email, tenant_id, admin, root, avatar_url, role_title, active, preferences`,
      [
        id,
        tenantId,
        data.name || null,
        data.avatar_url ?? null,
        data.role_title || null,
        data.preferences ? JSON.stringify(data.preferences) : null,
      ],
    );
    connect.release();
    return result.rows[0] || null;
  }

  static async atualizarAcessoUsuario(id: number, tenantId: number, data: Partial<UsuarioModel>) {
    const connect = await connection.connect();
    const result = await connect.query(
      `UPDATE users
       SET admin = COALESCE($3, admin),
           root = COALESCE($4, root),
           active = COALESCE($5, active),
           role_title = COALESCE($6, role_title),
           "updatedAt" = NOW()
       WHERE id = $1 AND tenant_id = $2
       RETURNING id, name, username, email, tenant_id, admin, root, avatar_url, role_title, active, preferences`,
      [id, tenantId, data.admin ?? null, data.root ?? null, data.active ?? null, data.role_title || null],
    );
    connect.release();
    return result.rows[0] || null;
  }

  static async findById(id: number) {
    const connect = await connection.connect();
    const result = await connect.query('SELECT * FROM users WHERE id = $1', [id]);
    connect.release();
    return result.rows[0] || null;
  }

  static async findByEmail(email: string) {
    const connect = await connection.connect();
    const result = await connect.query('SELECT * FROM users WHERE email = $1', [email]);
    connect.release();
    return result.rows[0] || null;
  }

  static async findByUsernameInTenant(username: string, tenantId: number) {
    const connect = await connection.connect();
    const result = await connect.query(
      'SELECT * FROM users WHERE tenant_id = $1 AND LOWER(username) = LOWER($2)',
      [tenantId, username],
    );
    connect.release();
    return result.rows[0] || null;
  }

  static async findByInternalLogin(accessCode: string, username: string) {
    const connect = await connection.connect();
    const result = await connect.query(
      `SELECT u.*
       FROM users u
       INNER JOIN tenants t ON t.id = u.tenant_id
       WHERE t.access_code = $1 AND LOWER(u.username) = LOWER($2)`,
      [accessCode, username],
    );
    connect.release();
    return result.rows[0] || null;
  }

  static async concluirOnboarding(id: number, data: { name?: string; username?: string }) {
    const connect = await connection.connect();
    const result = await connect.query(
      `UPDATE users
       SET name = COALESCE($2, name),
           username = COALESCE($3, username),
           onboarding_completed_at = NOW(),
           "updatedAt" = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, data.name || null, data.username || null],
    );
    connect.release();
    return result.rows[0] || null;
  }
}

export default UsuariosRepository;
