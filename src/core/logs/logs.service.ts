import LogsRepository from './logs.repository.js';

class LogsService {
  static async inserirLog(data: any) {
    // Fire and forget: não bloqueia o endpoint
    LogsRepository.inserirLog(data);
  }

  static async obterLogsPaginados(tenant_id: any, page: number, limit: number) {
    const result = await LogsRepository.obterLogsPaginados(tenant_id, page, limit);
    return { data: result.data || [], total: result.total || 0, page, limit };
  }
}

export default LogsService;
