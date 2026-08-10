import connection from '../../core/database/connection.js';
import type { StockWriteDto } from './estoque.dto.js';

const projection = 's.id, s.name, s.code, s.description, s.supplier_id, COALESCE(sup.name, s.supplier_name) AS supplier_name, s.quantity, s."purchasePrice", s."salePrice", s.warranty_days';

export default class EstoqueRepository {
  static async obterTodos(tenantId: number) {
    const connect = await connection.connect();
    try {
      const stocks = await connect.query(
        `SELECT ${projection} FROM stocks s LEFT JOIN suppliers sup ON sup.id = s.supplier_id WHERE s.tenant_id = $1 ORDER BY s.id DESC`,
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
        `INSERT INTO stocks (name, code, description, supplier_name, supplier_id, quantity, "purchasePrice", "salePrice", warranty_days, tenant_id, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         RETURNING id, name, code, description, supplier_name, supplier_id, quantity, "purchasePrice", "salePrice", warranty_days`,
        [stock.name, stock.code, stock.description, stock.supplier_name || null, stock.supplier_id || null, stock.quantity, stock.purchasePrice, stock.salePrice, stock.warranty_days, tenantId],
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
         SET name = $1, code = $2, description = $3, supplier_name = $4, supplier_id = $5, quantity = $6, "purchasePrice" = $7, "salePrice" = $8, warranty_days = $9, "updatedAt" = NOW()
         WHERE id = $10 AND tenant_id = $11
         RETURNING id, name, code, description, supplier_name, supplier_id, quantity, "purchasePrice", "salePrice", warranty_days`,
        [data.name, data.code, data.description, data.supplier_name || null, data.supplier_id || null, data.quantity, data.purchasePrice, data.salePrice, data.warranty_days, id, tenantId],
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
        `DELETE FROM stocks WHERE id = $1 AND tenant_id = $2 RETURNING id, name, code, description, supplier_name, supplier_id, quantity, "purchasePrice", "salePrice", warranty_days`,
        [id, tenantId],
      );
      return result.rows[0];
    } finally {
      connect.release();
    }
  }
}
