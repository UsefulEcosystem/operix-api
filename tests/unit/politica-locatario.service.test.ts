import PoliticaLocatarioService from '../../src/modules/locatarios/politica-locatario.service.js';
import LocatarioRepository from '../../src/modules/locatarios/locatarios.repository.js';
import { env } from '../../src/core/config/env.js';

describe('PoliticaLocatarioService', () => {
  const originalMode = env.deploymentMode;

  afterEach(() => {
    env.deploymentMode = originalMode;
    jest.restoreAllMocks();
  });

  test('bloqueia criação de tenant em modo LOCAL quando já existe tenant', async () => {
    env.deploymentMode = 'LOCAL';
    jest.spyOn(LocatarioRepository, 'count').mockResolvedValue(1);

    await expect(PoliticaLocatarioService.assertLocatarioCanBeCreated()).rejects.toThrow('instância local já foi configurada');
  });

  test('permite criação de múltiplos tenants em modo SAAS', async () => {
    env.deploymentMode = 'SAAS';
    jest.spyOn(LocatarioRepository, 'count').mockResolvedValue(3);

    await expect(PoliticaLocatarioService.assertLocatarioCanBeCreated()).resolves.toBeUndefined();
  });

  test('expõe estado público para bloquear cadastro visual em LOCAL configurado', async () => {
    env.deploymentMode = 'LOCAL';
    jest.spyOn(LocatarioRepository, 'count').mockResolvedValue(1);

    await expect(PoliticaLocatarioService.obterEstadoPublico()).resolves.toEqual(expect.objectContaining({
      deployment_mode: 'LOCAL',
      registration_enabled: false,
      local_instance_configured: true,
    }));
  });
});
