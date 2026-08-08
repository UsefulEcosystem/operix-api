// @ts-nocheck
import connection from "../../core/database/connection.js";
import MensageriaService from "../../core/utils/mensageria.service.js";
import OrdemServicoRepository from "../ordens-servico/ordem-servico.repository.js";
import Utilitarios from "../../core/utils/utilitarios.js";

class ServicosRepository {
  static async recarregarDadosSocket(tenant_id) {
    const data = await this.obterTodos(tenant_id);
    MensageriaService.notificarLocatario(tenant_id, "reloadDataService", data);
    return true;
  }

  static async obterTodos(tenant_id) {
    const connect = await connection.connect();
    try {
      const services = await connect.query(
        `SELECT id, client_id, product, client, telephone, adress, status_id, payment_status_id,
                order_of_service, observation, created_at, updated_at_service, updated_at_payment
         FROM services WHERE tenant_id = $1 ORDER BY id DESC`,
        [tenant_id],
      );
      return services.rows;
    } finally {
      connect.release();
    }
  }

  static async obterTodosNaoConcluidos(tenant_id) {
    const connect = await connection.connect();
    try {
      const services = await connect.query(
        `SELECT s.id, s.client_id, s.product, s.client, s.telephone, s.adress, s.status_id,
                s.payment_status_id, s.order_of_service, s.observation, s.created_at,
                s.updated_at_service, s.updated_at_payment
         FROM services s
         LEFT JOIN status_service ss ON ss.id = s.status_id AND ss.tenant_id = s.tenant_id
         WHERE s.tenant_id = $1
           AND (ss.description IS NULL OR LOWER(ss.description) NOT IN ('concluído', 'concluido', 'finalizado'))
         ORDER BY s.id DESC`,
        [tenant_id],
      );
      return services.rows;
    } finally {
      connect.release();
    }
  }

  static async criar(service) {
    const {
      tenant_id,
      client_id,
      product,
      client,
      telephone,
      adress,
      status_id,
      payment_status_id,
      observation,
      created_at
    } = service;
    const cod_order = await OrdemServicoRepository.criar(created_at, tenant_id);
    if (!cod_order) return false;

    const connect = await connection.connect();
    const created = await connect.query(
      "INSERT INTO services(tenant_id, client_id, product, client, telephone, adress, status_id, payment_status_id, order_of_service, observation, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
      [
        tenant_id,
        client_id || null,
        product,
        client,
        telephone,
        adress,
        status_id,
        payment_status_id,
        cod_order,
        observation,
        created_at,
      ],
    );
    connect.release();
    await this.recarregarDadosSocket(tenant_id);
    return created.rowCount;
  }


  static async atualizarInfoCliente(id, tenant_id, info) {
    const { client_id, product, client, telephone, adress, observation } = info;
    const connect = await connection.connect();
    const updated = await connect.query(
      "UPDATE services SET client_id = $1, product = $2, client = $3, telephone = $4, adress = $5, observation = $6 WHERE id = $7 AND tenant_id = $8",
      [client_id || null, product, client, telephone, adress, observation, id, tenant_id],
    );
    connect.release();
    await this.recarregarDadosSocket(tenant_id);
    return updated.rowCount;
  }

  static async atualizarStatusServico(id, tenant_id, status_id) {
    const updated_at_service = Utilitarios.gerarDataLocal();
    const connect = await connection.connect();
    const updated = await connect.query(
      "UPDATE services SET status_id = $1, updated_at_service = $2 WHERE id = $3 AND tenant_id = $4 RETURNING id",
      [status_id, updated_at_service, id, tenant_id],
    );
    connect.release();
    await this.recarregarDadosSocket(tenant_id);
    return updated.rowCount;
  }

  static async atualizarStatusPagamento(
    id,
    tenant_id,
    payment_status_id
  ) {
    const updated_at_payment = Utilitarios.gerarDataLocal();
    const connect = await connection.connect();
    const updated = await connect.query(
      "UPDATE services SET payment_status_id = $1, updated_at_payment = $2 WHERE id = $3 AND tenant_id = $4",
      [payment_status_id, updated_at_payment, id, tenant_id],
    );
    connect.release();
    await this.recarregarDadosSocket(tenant_id);
    return updated.rowCount;
  }

  static async remover(id, tenant_id, cod_order) {
    const connect = await connection.connect();
    const removed = await connect.query(
      "DELETE FROM services WHERE id = $1 AND tenant_id = $2",
      [id, tenant_id],
    );
    connect.release();
    await this.recarregarDadosSocket(tenant_id);
    if (removed.rowCount)
      await OrdemServicoRepository.remover(cod_order, tenant_id);
    return removed.rowCount;
  }
}

export default ServicosRepository;
