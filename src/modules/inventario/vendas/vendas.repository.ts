// @ts-nocheck
import connection from '../../../core/database/connection.js';
import ErroValidacao from '../../../core/utils/erro-validacao.js';

function addMonths(date, months) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + Number(months || 0));
  return copy;
}

function toNumber(value) {
  return Number(value || 0);
}

export default class VendasRepository {
  static async listar(tenantId) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `SELECT s.*,
                COALESCE(json_agg(si.*) FILTER (WHERE si.id IS NOT NULL), '[]') AS items
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

  static async obterPorId(id, tenantId) {
    const connect = await connection.connect();
    try {
      const saleResult = await connect.query('SELECT * FROM sales WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
      const sale = saleResult.rows[0];
      if (!sale) {
        return null;
      }

      const itemsResult = await connect.query(
        'SELECT * FROM sale_items WHERE sale_id = $1 AND tenant_id = $2 ORDER BY id',
        [id, tenantId],
      );
      const warrantiesResult = await connect.query(
        'SELECT * FROM warranties WHERE sale_id = $1 AND tenant_id = $2 ORDER BY id',
        [id, tenantId],
      );

      return { ...sale, items: itemsResult.rows, warranties: warrantiesResult.rows };
    } finally {
      connect.release();
    }
  }

  static async criar(tenantId, data) {
    const connect = await connection.connect();
    try {
      await connect.query('BEGIN');

      const soldAt = data.sold_at ? new Date(data.sold_at) : new Date();
      const saleResult = await connect.query(
        `INSERT INTO sales
         (tenant_id, customer_name, customer_document, customer_phone, total_amount, status, notes, sold_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 0, 'completed', $5, $6, NOW(), NOW())
         RETURNING *`,
        [
          tenantId,
          data.customer_name,
          data.customer_document || null,
          data.customer_phone || null,
          data.notes || null,
          soldAt,
        ],
      );
      const sale = saleResult.rows[0];
      const items = [];
      const warranties = [];
      let totalAmount = 0;

      for (const item of data.items || []) {
        const stock = await this.lockStock(connect, item.stock_id, tenantId);
        const quantity = Number(item.quantity || 1);
        if (quantity <= 0) {
          throw new ErroValidacao('Quantidade deve ser maior que zero.', 400);
        }
        if (Number(stock.quantity) < quantity) {
          throw new ErroValidacao(`Estoque insuficiente para ${stock.name}.`, 409);
        }

        const unitPrice = item.unit_price ?? stock.salePrice ?? stock.saleprice ?? stock.sale_price;
        const normalizedUnitPrice = toNumber(unitPrice);
        const totalPrice = normalizedUnitPrice * quantity;
        const warrantyMonths = Number(item.warranty_months || 0);
        totalAmount += totalPrice;

        const itemResult = await connect.query(
          `INSERT INTO sale_items
           (tenant_id, sale_id, stock_id, item_name, item_code, serial_number, quantity, unit_price, total_price, warranty_months, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
           RETURNING *`,
          [
            tenantId,
            sale.id,
            stock.id,
            stock.name,
            stock.code,
            item.serial_number || null,
            quantity,
            normalizedUnitPrice,
            totalPrice,
            warrantyMonths,
          ],
        );
        const saleItem = itemResult.rows[0];
        items.push(saleItem);

        await connect.query(
          'UPDATE stocks SET quantity = quantity - $1, updatedAt = NOW() WHERE id = $2 AND tenant_id = $3',
          [quantity, stock.id, tenantId],
        );

        if (warrantyMonths > 0) {
          const warrantyResult = await connect.query(
            `INSERT INTO warranties
             (tenant_id, source_type, sale_id, sale_item_id, stock_id, customer_name, customer_document, customer_phone,
              item_name, item_code, serial_number, quantity, warranty_start_at, warranty_end_at, status, notes, created_at, updated_at)
             VALUES ($1, 'sale', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'active', $14, NOW(), NOW())
             RETURNING *`,
            [
              tenantId,
              sale.id,
              saleItem.id,
              stock.id,
              data.customer_name,
              data.customer_document || null,
              data.customer_phone || null,
              stock.name,
              stock.code,
              item.serial_number || null,
              quantity,
              soldAt,
              addMonths(soldAt, warrantyMonths),
              item.notes || data.notes || null,
            ],
          );
          warranties.push(warrantyResult.rows[0]);
        }
      }

      const updatedSaleResult = await connect.query(
        'UPDATE sales SET total_amount = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3 RETURNING *',
        [totalAmount, sale.id, tenantId],
      );

      await connect.query('COMMIT');
      return { ...updatedSaleResult.rows[0], items, warranties };
    } catch (error) {
      await connect.query('ROLLBACK');
      throw error;
    } finally {
      connect.release();
    }
  }

  static async lockStock(connect, stockId, tenantId) {
    const result = await connect.query(
      'SELECT * FROM stocks WHERE id = $1 AND tenant_id = $2 FOR UPDATE',
      [stockId, tenantId],
    );
    const stock = result.rows[0];
    if (!stock) {
      throw new ErroValidacao('Item de estoque não encontrado.', 404);
    }
    return stock;
  }
}
