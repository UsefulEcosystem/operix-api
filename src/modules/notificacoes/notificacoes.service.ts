// @ts-nocheck
import NotificacoesRepository from './notificacoes.repository.js';

class NotificacoesService {
  static async listar(tenant_id) { return NotificacoesRepository.listar(tenant_id); }
}

export default NotificacoesService;
