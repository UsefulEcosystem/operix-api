// @ts-nocheck
import connection from '../../core/database/connection.js';
import MensageriaService from '../../core/utils/mensageria.service.js';

class OrdemServicoRepository {
  static async recarregarDadosSocket(cod_order, tenant_id) {
    const data = await this.obterUnico(cod_order, tenant_id);
    MensageriaService.notificarLocatario(tenant_id, 'reloadDataOrders', data);
    return true;
  }

  static async obterUnico(cod, tenant_id) {
    const connect = await connection.connect();
    const result = await connect.query(
      'SELECT cod_order, estimate, value, warranty_days, created_at FROM order_of_service WHERE cod_order = $1 AND tenant_id = $2',
      [cod, tenant_id],
    );
    connect.release();
    return result.rows;
  }

  static async obterTodos(tenant_id) {
    const connect = await connection.connect();
    const result = await connect.query(
      'SELECT cod_order, estimate, value, warranty_days, created_at FROM order_of_service WHERE tenant_id = $1 ORDER BY cod_order DESC',
      [tenant_id],
    );
    connect.release();
    return result.rows;
  }

  static async criar(created_at, tenant_id) {
    const connect = await connection.connect();
    const result = await connect.query('INSERT INTO order_of_service(created_at, tenant_id) VALUES ($1, $2) RETURNING cod_order', [created_at, tenant_id]);
    connect.release();
    return result.rows[0].cod_order;
  }

  static async removerOrcamento(cod, tenant_id, idEstimate) {
    const getOrderValue = await this.obterUnico(cod, tenant_id);
    if (getOrderValue.length === 0) return 0;
    let estimateArray = JSON.parse(getOrderValue[0].estimate);
    estimateArray = estimateArray.filter((e) => e.id != idEstimate);
    let newValue = 0;
    for (const record of estimateArray) newValue += record.price;
    estimateArray = JSON.stringify(estimateArray);
    const connect = await connection.connect();
    const removed = await connect.query('UPDATE order_of_service SET estimate = $1, value = $2 WHERE cod_order = $3 AND tenant_id = $4', [estimateArray, newValue, cod, tenant_id]);
    connect.release();
    await this.recarregarDadosSocket(cod, tenant_id);
    return removed.rowCount;
  }

  static async removerOrcamentoSimple(cod, tenant_id) {
    const connect = await connection.connect();
    const removed = await connect.query('UPDATE order_of_service SET estimate = $1, value = $2 WHERE cod_order = $3 AND tenant_id = $4', [null, null, cod, tenant_id]);
    connect.release();
    await this.recarregarDadosSocket(cod, tenant_id);
    return removed.rowCount;
  }

  static async atualizarOrcamento(estimateArray, totalPrice, cod, tenant_id, warrantyDays) {
    const connect = await connection.connect();
    const updated = await connect.query('UPDATE order_of_service SET estimate = $1, value = $2, warranty_days = COALESCE($5, warranty_days) WHERE cod_order = $3 AND tenant_id = $4', [estimateArray, totalPrice, cod, tenant_id, warrantyDays ?? null]);
    connect.release();
    await this.recarregarDadosSocket(cod, tenant_id);
    return updated.rowCount;
  }

  static async atualizarGarantia(cod, tenant_id, warrantyDays) {
    const connect = await connection.connect();
    const updated = await connect.query('UPDATE order_of_service SET warranty_days = $1 WHERE cod_order = $2 AND tenant_id = $3 RETURNING cod_order, warranty_days', [warrantyDays, cod, tenant_id]);
    connect.release();
    await this.recarregarDadosSocket(cod, tenant_id);
    return updated.rows[0] || null;
  }

  static async remover(cod_order, tenant_id) {
    const connect = await connection.connect();
    const removed = await connect.query('DELETE FROM order_of_service WHERE cod_order = $1 AND tenant_id = $2', [cod_order, tenant_id]);
    connect.release();
    return removed.rowCount;
  }
}

export default OrdemServicoRepository;
