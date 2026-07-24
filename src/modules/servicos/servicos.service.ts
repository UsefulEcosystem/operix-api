// @ts-nocheck
import ServicosRepository from "./servicos.repository.js";
import Utilitarios from "../../core/utils/utilitarios.js";
import StatusPagamentoRepository from '../status-pagamento/status-pagamento.repository.js';
import ErroValidacao from '../../core/utils/erro-validacao.js';
import type { ServiceCreateDto } from './servicos.dto.js';

class ServicosService {
  static async obterTodos(tenant_id) {
    return ServicosRepository.obterTodos(tenant_id);
  }


  static async obterNaoConcluidos(tenant_id) {
    return ServicosRepository.obterTodosNaoConcluidos(tenant_id);
  }

  static async criar(tenantId: number, data: ServiceCreateDto) {
    const created_at = Utilitarios.gerarDataLocal();
    const paymentStatus = await StatusPagamentoRepository.obterStatusDefault(tenantId);
    if (!paymentStatus[0]) {
      throw new ErroValidacao('Cadastre um status de pagamento padrão antes de criar serviços.', 422);
    }
    const service = {
      ...data,
      tenant_id: tenantId,
      created_at,
      payment_status_id: paymentStatus[0].id,
    };
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
