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

export default class GarantiasRepository {
  static async listar(tenantId, filters = {}) {
    const connect = await connection.connect();
    try {
      const params = [tenantId];
      const where = ['tenant_id = $1'];

      if (filters.status) {
        params.push(filters.status);
        where.push(`status = $${params.length}`);
      }

      if (filters.source_type) {
        params.push(filters.source_type);
        where.push(`source_type = $${params.length}`);
      }

      const result = await connect.query(
        `SELECT * FROM warranties
         WHERE ${where.join(' AND ')}
         ORDER BY warranty_end_at DESC, id DESC`,
        params,
      );
      return result.rows;
    } finally {
      connect.release();
    }
  }

  static async obterPorId(id, tenantId) {
    const connect = await connection.connect();
    try {
      const result = await connect.query('SELECT * FROM warranties WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
      return result.rows[0] || null;
    } finally {
      connect.release();
    }
  }

  static async registrarPecaServico(tenantId, serviceId, data) {
    const connect = await connection.connect();
    try {
      await connect.query('BEGIN');

      const serviceResult = await connect.query(
        'SELECT * FROM services WHERE id = $1 AND tenant_id = $2 LIMIT 1',
        [serviceId, tenantId],
      );
      const service = serviceResult.rows[0];
      if (!service) {
        throw new ErroValidacao('Serviço não encontrado.', 404);
      }

      const stock = await this.lockStock(connect, data.stock_id, tenantId);
      const quantity = Number(data.quantity || 1);
      if (quantity <= 0) {
        throw new ErroValidacao('Quantidade deve ser maior que zero.', 400);
      }
      if (Number(stock.quantity) < quantity) {
        throw new ErroValidacao(`Estoque insuficiente para ${stock.name}.`, 409);
      }

      const unitPrice = data.unit_price ?? stock.saleprice ?? stock.salePrice ?? stock.sale_price ?? stock.saleprice;
      const normalizedUnitPrice = toNumber(unitPrice);
      const totalPrice = normalizedUnitPrice * quantity;
      const usedAt = data.used_at ? new Date(data.used_at) : new Date();
      const warrantyMonths = Number(data.warranty_months || 0);

      const partResult = await connect.query(
        `INSERT INTO service_parts
         (tenant_id, service_id, stock_id, item_name, item_code, serial_number, quantity, unit_price, total_price, warranty_months, used_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
         RETURNING *`,
        [
          tenantId,
          service.id,
          stock.id,
          stock.name,
          stock.code,
          data.serial_number || null,
          quantity,
          normalizedUnitPrice,
          totalPrice,
          warrantyMonths,
          usedAt,
        ],
      );

      await connect.query(
        'UPDATE stocks SET quantity = quantity - $1, updatedAt = NOW() WHERE id = $2 AND tenant_id = $3',
        [quantity, stock.id, tenantId],
      );

      let warranty = null;
      if (warrantyMonths > 0) {
        const warrantyResult = await connect.query(
          `INSERT INTO warranties
           (tenant_id, source_type, service_id, service_part_id, stock_id, customer_name, customer_document, customer_phone,
            item_name, item_code, serial_number, quantity, warranty_start_at, warranty_end_at, status, notes, created_at, updated_at)
           VALUES ($1, 'service', $2, $3, $4, $5, NULL, $6, $7, $8, $9, $10, $11, $12, 'active', $13, NOW(), NOW())
           RETURNING *`,
          [
            tenantId,
            service.id,
            partResult.rows[0].id,
            stock.id,
            service.client,
            service.telephone || null,
            stock.name,
            stock.code,
            data.serial_number || null,
            quantity,
            usedAt,
            addMonths(usedAt, warrantyMonths),
            data.notes || null,
          ],
        );
        warranty = warrantyResult.rows[0];
      }

      await connect.query('COMMIT');
      return { service_part: partResult.rows[0], warranty };
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
