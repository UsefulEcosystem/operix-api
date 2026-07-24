import cron from 'node-cron';
import ServicosService from './servicos.service.js';
import LocatariosRepository from '../locatarios/locatarios.repository.js';
import MensageriaService from '../../core/utils/mensageria.service.js';

export default class StuckServicesJob {
  /**
   * Inicializa o cron job que roda a cada hora.
   * Varre OS paradas de cada tenant e empurra notificações via Socket.io.
   */
  static init() {
    cron.schedule('0 * * * *', async () => {
      console.log('[Job: StuckServices] Iniciando varredura periódica de serviços parados...');
      try {
        const tenants = await LocatariosRepository.obterTodos();
        for (const tenant of tenants) {
          const notConcluded = await ServicosService.obterNaoConcluidos(tenant.id);
          const currentDate = new Date();
          const ninetyDaysAgo = new Date(currentDate);
          ninetyDaysAgo.setDate(currentDate.getDate() - 90);

          const notifications = notConcluded.filter((s: any) => new Date(s.created_at) < ninetyDaysAgo);
          if (notifications.length > 0) {
            MensageriaService.notificarLocatario(tenant.id, '@service/stuck_services_alert', { count: notifications.length, services: notifications });
          }
        }
      } catch (err) {
        console.error('[Job: StuckServices] Erro ao varrer serviços parados:', err);
      }
    });
  }
}
