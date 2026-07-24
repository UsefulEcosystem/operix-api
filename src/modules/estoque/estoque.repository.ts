import connection from '../../core/database/connection.js';
import type { StockWriteDto } from './estoque.dto.js';

const projection = 'id, name, code, description, quantity, "purchasePrice", "salePrice"';

export default class EstoqueRepository {
  static async obterTodos(tenantId: number) {
    const connect = await connection.connect();
    try {
      const stocks = await connect.query(
        `SELECT ${projection} FROM stocks WHERE tenant_id = $1 ORDER BY id DESC`,
        [tenantId],
      );
      return stocks.rows;
    } finally {
      connect.release();
    }
  }

  static async criar(tenantId: number, stock: StockWriteDto) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `INSERT INTO stocks (name, code, description, quantity, "purchasePrice", "salePrice", tenant_id, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING ${projection}`,
        [stock.name, stock.code, stock.description, stock.quantity, stock.purchasePrice, stock.salePrice, tenantId],
      );
      return result.rows[0];
    } finally {
      connect.release();
    }
  }

  static async atualizar(id: number, tenantId: number, data: StockWriteDto) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `UPDATE stocks
         SET name = $1, code = $2, description = $3, quantity = $4, "purchasePrice" = $5, "salePrice" = $6, "updatedAt" = NOW()
         WHERE id = $7 AND tenant_id = $8
         RETURNING ${projection}`,
        [data.name, data.code, data.description, data.quantity, data.purchasePrice, data.salePrice, id, tenantId],
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
        `DELETE FROM stocks WHERE id = $1 AND tenant_id = $2 RETURNING ${projection}`,
        [id, tenantId],
      );
      return result.rows[0];
    } finally {
      connect.release();
    }
  }
}
