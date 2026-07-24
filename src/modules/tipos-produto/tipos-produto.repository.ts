import connection from '../../core/database/connection.js';
import type { TypeProductCreateDto } from './tipos-produto.dto.js';

export default class TiposProdutoRepository {
  static async obterTodos(tenantId: number) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        'SELECT id, name FROM types_product WHERE tenant_id = $1 ORDER BY id',
        [tenantId],
      );
      return result.rows;
    } finally {
      connect.release();
    }
  }

  static async criar(tenantId: number, typeProduct: TypeProductCreateDto) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        'INSERT INTO types_product (tenant_id, name) VALUES ($1, $2) RETURNING id, name',
        [tenantId, typeProduct.name],
      );
      return result.rows[0];
    } finally {
      connect.release();
    }
  }

  static async remover(id: number, tenantId: number) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        'DELETE FROM types_product WHERE id = $1 AND tenant_id = $2 RETURNING id, name',
        [id, tenantId],
      );
      return result.rows[0];
    } finally {
      connect.release();
    }
  }
}
