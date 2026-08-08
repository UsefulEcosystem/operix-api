import connection from '../../core/database/connection.js';
import type { StockWriteDto } from './estoque.dto.js';

const projection = 'id, name, code, description, supplier_name, quantity, "purchasePrice", "salePrice", warranty_days';

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
        `INSERT INTO stocks (name, code, description, supplier_name, quantity, "purchasePrice", "salePrice", warranty_days, tenant_id, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         RETURNING ${projection}`,
        [stock.name, stock.code, stock.description, stock.supplier_name || null, stock.quantity, stock.purchasePrice, stock.salePrice, stock.warranty_days, tenantId],
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
         SET name = $1, code = $2, description = $3, supplier_name = $4, quantity = $5, "purchasePrice" = $6, "salePrice" = $7, warranty_days = $8, "updatedAt" = NOW()
         WHERE id = $9 AND tenant_id = $10
         RETURNING ${projection}`,
        [data.name, data.code, data.description, data.supplier_name || null, data.quantity, data.purchasePrice, data.salePrice, data.warranty_days, id, tenantId],
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
