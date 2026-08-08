import connection from '../../core/database/connection.js';
import ErroValidacao from '../../core/utils/erro-validacao.js';
import type { SaleCreateDto } from './vendas.dto.js';

const saleProjection = 'id, client_id, customer_name, customer_document, customer_phone, total_amount, notes, sold_at';
const itemProjection = 'id, stock_id, item_name, item_code, serial_number, quantity, unit_price, total_price, warranty_days';

export default class VendasRepository {
  static async listar(tenantId: number) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `SELECT s.id, s.client_id, s.customer_name, s.customer_document, s.customer_phone, s.total_amount, s.notes, s.sold_at,
                COALESCE(
                  json_agg(json_build_object(
                    'id', si.id,
                    'stock_id', si.stock_id,
                    'item_name', si.item_name,
                    'item_code', si.item_code,
                    'serial_number', si.serial_number,
                    'quantity', si.quantity,
                    'unit_price', si.unit_price,
                    'total_price', si.total_price
                    ,'warranty_days', si.warranty_days
                  ) ORDER BY si.id) FILTER (WHERE si.id IS NOT NULL),
                  '[]'
                ) AS items
         FROM sales s
         LEFT JOIN sale_items si ON si.sale_id = s.id AND si.tenant_id = s.tenant_id
         WHERE s.tenant_id = $1
         GROUP BY s.id
         ORDER BY s.sold_at DESC, s.id DESC`,
        [tenantId],
      );
      return result.rows;
    } finally {
      connect.release();
    }
  }

  static async obterPorId(id: number, tenantId: number) {
    const connect = await connection.connect();
    try {
      const saleResult = await connect.query(
        `SELECT ${saleProjection} FROM sales WHERE id = $1 AND tenant_id = $2`,
        [id, tenantId],
      );
      const sale = saleResult.rows[0];
      if (!sale) {
        return null;
      }

      const itemsResult = await connect.query(
        `SELECT ${itemProjection} FROM sale_items WHERE sale_id = $1 AND tenant_id = $2 ORDER BY id`,
        [id, tenantId],
      );
      return { ...sale, items: itemsResult.rows };
    } finally {
      connect.release();
    }
  }

  static async criar(tenantId: number, data: SaleCreateDto) {
    const connect = await connection.connect();
    try {
      await connect.query('BEGIN');

      const soldAt = data.sold_at ? new Date(data.sold_at) : new Date();
      const saleResult = await connect.query(
        `INSERT INTO sales
         (tenant_id, client_id, customer_name, customer_document, customer_phone, total_amount, status, notes, sold_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 0, 'completed', $6, $7, NOW(), NOW())
         RETURNING ${saleProjection}`,
        [tenantId, data.client_id || null, data.customer_name, data.customer_document || null, data.customer_phone || null, data.notes || null, soldAt],
      );
      const sale = saleResult.rows[0];
      const items = [];
      let totalAmount = 0;

      for (const item of data.items) {
        const stockResult = await connect.query(
          'SELECT id, name, code, quantity, "salePrice", warranty_days FROM stocks WHERE id = $1 AND tenant_id = $2 FOR UPDATE',
          [item.stock_id, tenantId],
        );
        const stock = stockResult.rows[0];
        if (!stock) {
          throw new ErroValidacao('Item de estoque não encontrado.', 404);
        }
        if (Number(stock.quantity) < item.quantity) {
          throw new ErroValidacao(`Estoque insuficiente para ${stock.name}.`, 409);
        }

        const unitPrice = Number(item.unit_price ?? stock.salePrice ?? stock.saleprice ?? 0);
        const totalPrice = unitPrice * item.quantity;
        const warrantyDays = Number(item.warranty_days ?? stock.warranty_days ?? 0);
        totalAmount += totalPrice;

        const itemResult = await connect.query(
          `INSERT INTO sale_items
           (tenant_id, sale_id, stock_id, item_name, item_code, serial_number, quantity, unit_price, total_price, warranty_days, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
           RETURNING ${itemProjection}`,
          [tenantId, sale.id, stock.id, stock.name, stock.code, item.serial_number || null, item.quantity, unitPrice, totalPrice, warrantyDays],
        );
        items.push(itemResult.rows[0]);

        await connect.query(
          'UPDATE stocks SET quantity = quantity - $1, "updatedAt" = NOW() WHERE id = $2 AND tenant_id = $3',
          [item.quantity, stock.id, tenantId],
        );
      }

      const updatedSaleResult = await connect.query(
        `UPDATE sales SET total_amount = $1, updated_at = NOW()
         WHERE id = $2 AND tenant_id = $3 RETURNING ${saleProjection}`,
        [totalAmount, sale.id, tenantId],
      );
      await connect.query('COMMIT');
      return { ...updatedSaleResult.rows[0], items };
    } catch (error) {
      await connect.query('ROLLBACK');
      throw error;
    } finally {
      connect.release();
    }
  }
}
