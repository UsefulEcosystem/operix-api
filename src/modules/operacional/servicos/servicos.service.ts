// @ts-nocheck
import ServicosRepository from "./servicos.repository.js";
import Utilitarios from "../../../core/utils/utilitarios.js";
import StatusPaymentRepository from "../../configuracoes/status-pagamento/status-pagamento.repository.ts";

class ServicosService {
  static async obterTodos(tenant_id) {
    return ServicosRepository.obterTodos(tenant_id);
  }


  static async obterNaoConcluidos(tenant_id) {
    return ServicosRepository.obterTodosNaoConcluidos(tenant_id);
  }

  static async criar(service) {
    const created_at = Utilitarios.gerarDataLocal();
    const payment_status_id_initial = await StatusPaymentRepository.obterStatusDefault(service.tenant_id);
    service.created_at = created_at;
    service.payment_status_id = payment_status_id_initial[0].id;
    return ServicosRepository.criar(service);
  }

  static async atualizarInfoCliente(id, tenant_id, info) {
    return ServicosRepository.atualizarInfoCliente(id, tenant_id, info);
  }
  static async atualizarStatusServico(id, tenant_id, status_id) {
    return ServicosRepository.atualizarStatusServico(
      id,
      tenant_id,
      status_id
    );
  }
  static async atualizarStatusPagamento(
    id,
    tenant_id,
    payment_status_id
  ) {
    return ServicosRepository.atualizarStatusPagamento(
      id,
      tenant_id,
      payment_status_id
    );
  }
  static async remover(id, tenant_id, cod) {
    return ServicosRepository.remover(id, tenant_id, cod);
  }
}

export default ServicosService;

// API pública do módulo usada por notifications
export { ServicosService as ConsultaServicosService };
