import PermissoesService from '../../src/core/perfil/permissoes/permissoes.service.js';
import { env } from '../../src/core/config/env.js';
import { buildPlanContext } from '../../src/core/perfil/permissoes/planos.catalog.js';

describe('PermissoesService', () => {
  const originalMode = env.deploymentMode;

  afterEach(() => {
    env.deploymentMode = originalMode;
  });

  test('resolve permissões a partir das roles', () => {
    const snapshot = PermissoesService.construirSnapshotPermissao({
      roles: ['module:inventory'],
      overrides: [],
    });

    expect(snapshot.effective_permissions).toContain('dashboard.access');
    expect(snapshot.effective_permissions).toContain('inventory.stock.access');
  });

  test('allow explícito libera permissão sem role base', () => {
    const snapshot = PermissoesService.construirSnapshotPermissao({
      roles: [],
      overrides: [{ permission_key: 'organization.users.access', effect: 'allow' }],
    });

    expect(snapshot.effective_permissions).toContain('organization.users.access');
  });

  test('deny explícito bloqueia permissão mesmo com role base', () => {
    const snapshot = PermissoesService.construirSnapshotPermissao({
      roles: ['module:inventory'],
      overrides: [{ permission_key: 'inventory.stock.access', effect: 'deny' }],
    });

    expect(snapshot.effective_permissions).not.toContain('inventory.stock.access');
  });

  test('catálogo contém módulos gerenciáveis', () => {
    const catalog = PermissoesService.obterCatalogo();
    expect(catalog.modules.some((module) => module.key === 'operational')).toBe(true);
    expect(catalog.permissions.some((permission) => permission.key === 'dashboard.access')).toBe(true);
  });

  test('modo LOCAL libera todas as permissões via policy central', () => {
    env.deploymentMode = 'LOCAL';
    const access = buildPlanContext({ plan_key: 'free' });
    const snapshot = PermissoesService.construirSnapshotPermissao({
      roles: [],
      overrides: [],
      fullAccess: true,
      planPermissaoKeys: access.permission_keys,
      planContext: access,
    });

    expect(snapshot.effective_permissions).toContain('inventory.stock.access');
    expect(snapshot.effective_permissions).toContain('organization.settings.access');
    expect(snapshot.access.full_access).toBe(true);
  });

  test('admin libera todas as permissões independentemente do plano', () => {
    env.deploymentMode = 'SAAS';
    const access = buildPlanContext({ plan_key: 'free' });
    const snapshot = PermissoesService.construirSnapshotPermissao({
      roles: [],
      overrides: [],
      fullAccess: true,
      planPermissaoKeys: access.permission_keys,
      planContext: access,
    });

    expect(snapshot.effective_permissions).toContain('operational.services.access');
    expect(snapshot.effective_permissions).toContain('organization.users.access');
    expect(snapshot.effective_permissions).toContain('inventory.stock.access');
  });

  test('trial SaaS mantém acesso completo por 30 dias', () => {
    env.deploymentMode = 'SAAS';
    const access = buildPlanContext({
      plan_key: 'trial',
      subscription_status: 'trialing',
      trial_ends_at: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    });

    expect(access.trial.active).toBe(true);
    expect(access.permission_keys).toContain('inventory.stock.access');
  });

  test('trial vencido cai para permissões do plano configurado', () => {
    env.deploymentMode = 'SAAS';
    const access = buildPlanContext({
      plan_key: 'free',
      subscription_status: 'trialing',
      trial_ends_at: new Date(Date.now() - 86_400_000).toISOString(),
    });
    const snapshot = PermissoesService.construirSnapshotPermissao({
      roles: ['module:inventory'],
      overrides: [],
      planPermissaoKeys: access.permission_keys,
      planContext: access,
    });

    expect(access.trial.active).toBe(false);
    expect(snapshot.effective_permissions).not.toContain('inventory.stock.access');
  });
});
