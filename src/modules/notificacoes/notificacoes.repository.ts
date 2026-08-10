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

    const serviceNotifications = systemInfo.map((service: any): NotificationDto => ({
      kind: 'service',
      id: service.id,
      product: service.product,
      client: service.client,
      telephone: service.telephone,
      order_of_service: service.order_of_service,
      created_at: service.created_at,
      status_id: service.status_id,
      days: Math.floor((currentDate.getTime() - new Date(service.created_at).getTime()) / 86_400_000),
    }));

    const connect = await (await import('../../core/database/connection.js')).default.connect();
    try {
      const reminders = await connect.query(
        `SELECT a.id, a.title, a.description, occurrences.occurrence_at AS starts_at, a.service_id, a.sale_id, a.recurrence_rule, s.order_of_service, s.client AS service_client, v.customer_name AS sale_customer_name
         FROM agenda_tasks a
         LEFT JOIN services s ON s.id = a.service_id AND s.tenant_id = a.tenant_id
         LEFT JOIN sales v ON v.id = a.sale_id AND v.tenant_id = a.tenant_id
         CROSS JOIN LATERAL generate_series(
           a.starts_at,
           CASE WHEN a.recurrence_rule = 'none' THEN a.starts_at ELSE COALESCE(a.recurrence_until::timestamptz + INTERVAL '1 day' - INTERVAL '1 second', a.starts_at) END,
           CASE a.recurrence_rule WHEN 'daily' THEN INTERVAL '1 day' WHEN 'weekly' THEN INTERVAL '1 week' WHEN 'monthly' THEN INTERVAL '1 month' ELSE INTERVAL '1 day' END
         ) AS occurrences(occurrence_at)
         WHERE a.tenant_id = $1 AND a.completed = false AND occurrences.occurrence_at <= NOW() + INTERVAL '1 day' AND occurrences.occurrence_at >= NOW() - INTERVAL '1 day'
         ORDER BY occurrences.occurrence_at ASC LIMIT 50`, [tenant_id]);
      return [
        ...serviceNotifications,
        ...reminders.rows.map((task: any) => ({
          kind: 'agenda',
          id: `agenda-${task.id}`,
          agenda_id: task.id,
          title: task.title,
          description: task.description,
          starts_at: task.starts_at,
          service_id: task.service_id,
          sale_id: task.sale_id,
          order_of_service: task.order_of_service,
          service_client: task.service_client,
          sale_customer_name: task.sale_customer_name,
        })),
      ];
    } finally { connect.release(); }
  }
}

export default NotificacoesRepository;
