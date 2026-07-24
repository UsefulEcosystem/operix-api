// @ts-nocheck
import ServicosService from '../servicos/servicos.service.js';
import type { NotificationDto } from './notificacoes.dto.js';

class NotificacoesRepository {
  static async listar(tenant_id) {
    const notConcluded = await ServicosService.obterNaoConcluidos(tenant_id);

    const currentDate = new Date();
    const ninetyDaysAgo = new Date(currentDate);
    ninetyDaysAgo.setDate(currentDate.getDate() - 90);

    const systemInfo = notConcluded.filter((service: any) => {
      const createdAt = new Date(service.created_at);
      return createdAt < ninetyDaysAgo;
    });

    return systemInfo.map((service: any): NotificationDto => ({
      id: service.id,
      product: service.product,
      client: service.client,
      telephone: service.telephone,
      order_of_service: service.order_of_service,
      created_at: service.created_at,
      status_id: service.status_id,
      days: Math.floor((currentDate.getTime() - new Date(service.created_at).getTime()) / 86_400_000),
    }));
  }
}

export default NotificacoesRepository;
