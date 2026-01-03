import connection from "../database/connection.js";

export default class UsersRepository {
  static async getAll() {
    const connect = await connection.connect();
    const users = await connect.query(
      "SELECT id, username, email, admin, signature FROM users"
    );
    connect.release();
    return users.rows;
  }

  static async getById(user) {
    const connect = await connection.connect();
    const users = await connect.query(
      `SELECT id, username, admin FROM users WHERE id = ${user.id}`
    );
    connect.release();
    return users.rows;
  }

  static async getSignature(user) {
    const connect = await connection.connect();
    const users = await connect.query(
      `SELECT signature FROM users WHERE id = ${user.id}`
    );
    connect.release();
    return users.rows[0].signature;
  }

  static async checkUsersExists(user) {
    const queryEmail = "SELECT * FROM users WHERE email = $1";
    const queryUsername = "SELECT * FROM users WHERE username = $1";

    const connect = await connection.connect();
    const checkEmail = await connect.query(queryEmail, [user.email]);
    const checkUsername = await connect.query(queryUsername, [user.username]);
    connect.release();

    return [checkEmail.rowCount, checkUsername.rowCount];
  }

  static async register(user) {
    const query =
      "INSERT INTO users (tenant_id, username, email, password, admin, signature) VALUES ($1, $2, $3, $4, $5, $6)";

    const values = [
      user.tenant_id, 
      user.username, 
      user.email, 
      user.password, 
      user.admin, 
      user.signature
    ];

    const connect = await connection.connect();
    const register = await connect.query(query, values);
    connect.release();

    return register.rows;
  }

  static async login(user) {
    const query = "SELECT * FROM users WHERE username = $1";
    const value = [user.username];
    const connect = await connection.connect();
    const result = await connect.query(query, value);
    connect.release();
    return result.rows;
  }

  static async remove(user) {
    const connect = await connection.connect();
    const removed = await connect.query("DELETE FROM users WHERE id = $1", [ user.id ]);
    connect.release();
    return removed.rowCount;
  }
}
