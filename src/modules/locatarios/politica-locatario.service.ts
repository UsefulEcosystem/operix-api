import connection from '../../core/database/connection.js';
import { env, isLocalDeployment } from '../../core/config/env.js';
import ErroValidacao from '../../core/utils/erro-validacao.js';
import LocatarioRepository from './locatarios.repository.js';

const TENANT_PROVISIONING_LOCK_KEY = 2026050601;

export default class PoliticaLocatarioService {
  static get deploymentMode() {
    return env.deploymentMode;
  }

  static async obterEstadoPublico() {
    const tenantCount = await LocatarioRepository.count();
    return {
      deployment_mode: env.deploymentMode,
      tenant_count: tenantCount,
      registration_enabled: !isLocalDeployment() || tenantCount === 0,
      onboarding_enabled: !isLocalDeployment() || tenantCount === 0,
      local_instance_configured: isLocalDeployment() && tenantCount > 0,
    };
  }

  static async assertLocatarioCanBeCreated() {
    if (!isLocalDeployment()) {
      return;
    }

    const tenantCount = await LocatarioRepository.count();
    if (tenantCount > 0) {
      throw new ErroValidacao('Esta instância local já foi configurada. Novos cadastros de empresa estão bloqueados.', 409);
    }
  }

  static async comBloqueioProvisionamentoLocatario<T>(callback: () => Promise<T>): Promise<T> {
    const connect = await connection.connect();

    try {
      await connect.query('SELECT pg_advisory_lock($1)', [TENANT_PROVISIONING_LOCK_KEY]);
      return await callback();
    } finally {
      await connect.query('SELECT pg_advisory_unlock($1)', [TENANT_PROVISIONING_LOCK_KEY]);
      connect.release();
    }
  }
}
