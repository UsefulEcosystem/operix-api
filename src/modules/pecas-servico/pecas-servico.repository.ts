import connection from '../../core/database/connection.js';
import ErroValidacao from '../../core/utils/erro-validacao.js';
import type { ServicePartCreateDto } from './pecas-servico.dto.js';

export default class PecasServicoRepository {
  static async listar(tenantId: number, serviceId: number) {
    const connect = await connection.connect();
    try {
      const result = await connect.query(
        `SELECT id, service_id, stock_id, item_name, item_code, serial_number, quantity, unit_price, total_price, used_at
         FROM service_parts WHERE tenant_id = $1 AND service_id = $2 ORDER BY id DESC`,
        [tenantId, serviceId],
      );
      return result.rows;
    } finally {
      connect.release();
    }
  }

  static async registrar(tenantId: number, serviceId: number, data: ServicePartCreateDto) {
    const connect = await connection.connect();
    try {
      await connect.query('BEGIN');

      const serviceResult = await connect.query(
        'SELECT id FROM services WHERE id = $1 AND tenant_id = $2 LIMIT 1',
        [serviceId, tenantId],
      );
      if (!serviceResult.rows[0]) {
        throw new ErroValidacao('Serviço não encontrado.', 404);
      }

      const stockResult = await connect.query(
        'SELECT id, name, code, quantity, "salePrice" FROM stocks WHERE id = $1 AND tenant_id = $2 FOR UPDATE',
        [data.stock_id, tenantId],
      );
      const stock = stockResult.rows[0];
      if (!stock) {
        throw new ErroValidacao('Item de estoque não encontrado.', 404);
      }
      if (Number(stock.quantity) < data.quantity) {
        throw new ErroValidacao(`Estoque insuficiente para ${stock.name}.`, 409);
      }

      const unitPrice = Number(data.unit_price ?? stock.saleprice ?? 0);
      const usedAt = data.used_at ? new Date(data.used_at) : new Date();
      const partResult = await connect.query(
        `INSERT INTO service_parts
         (tenant_id, service_id, stock_id, item_name, item_code, serial_number, quantity, unit_price, total_price, used_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
         RETURNING id, service_id, stock_id, item_name, item_code, serial_number, quantity, unit_price, total_price, used_at`,
        [
          tenantId,
          serviceId,
          stock.id,
          stock.name,
          stock.code,
          data.serial_number || null,
          data.quantity,
          unitPrice,
          unitPrice * data.quantity,
          usedAt,
        ],
      );

      await connect.query(
        'UPDATE stocks SET quantity = quantity - $1, "updatedAt" = NOW() WHERE id = $2 AND tenant_id = $3',
        [data.quantity, stock.id, tenantId],
      );
      await connect.query('COMMIT');
      return partResult.rows[0];
    } catch (error) {
      await connect.query('ROLLBACK');
      throw error;
    } finally {
      connect.release();
    }
  }

  static async remover(tenantId: number, serviceId: number, partId: number) {
    const connect = await connection.connect();
    try {
      await connect.query('BEGIN');
      const partResult = await connect.query(
        'DELETE FROM service_parts WHERE id = $1 AND service_id = $2 AND tenant_id = $3 RETURNING stock_id, quantity',
        [partId, serviceId, tenantId],
      );
      const part = partResult.rows[0];
      if (!part) {
        throw new ErroValidacao('Peça do serviço não encontrada.', 404);
      }
      await connect.query(
        'UPDATE stocks SET quantity = quantity + $1, "updatedAt" = NOW() WHERE id = $2 AND tenant_id = $3',
        [part.quantity, part.stock_id, tenantId],
      );
      await connect.query('COMMIT');
      return part;
    } catch (error) {
      await connect.query('ROLLBACK');
      throw error;
    } finally {
      connect.release();
    }
  }
}
