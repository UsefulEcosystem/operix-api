// @ts-nocheck
import connection from "../../../core/database/connection.js";
import MensageriaService from "../../../core/utils/mensageria.service.js";
import OrdemServicoRepository from "../ordem-servico/ordem-servico.repository.js";
import StatusPagamentoRepository from "../../configuracoes/status-pagamento/status-pagamento.repository.js";
import Utilitarios from "../../../core/utils/utilitarios.js";

class ServicosRepository {
  static async recarregarDadosSocket(tenant_id) {
    let data = await this.obterTodos(tenant_id);
    MensageriaService.notificarLocatario(tenant_id, "reloadDataService", data);
    return true;
  }

  static async obterTodos(tenant_id) {
    const connect = await connection.connect();
    const services = await connect.query(
      "SELECT * FROM services WHERE tenant_id = $1 ORDER BY id DESC",
      [tenant_id],
    );
    connect.release();
    return services.rows;
  }

  static async criar(service) {
    const {
      tenant_id,
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
      "INSERT INTO services(tenant_id, product, client, telephone, adress, status_id, payment_status_id, order_of_service, observation, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
      [
        tenant_id,
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
    const { product, client, telephone, adress, observation } = info;
    const connect = await connection.connect();
    const updated = await connect.query(
      "UPDATE services SET product = $1, client = $2, telephone = $3, adress = $4, observation = $5 WHERE id = $6 AND tenant_id = $7",
      [product, client, telephone, adress, observation, id, tenant_id],
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
