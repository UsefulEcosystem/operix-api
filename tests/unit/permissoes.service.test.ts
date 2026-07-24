import PermissoesService from '../../src/core/permissoes/permissoes.service.js';
import { env } from '../../src/core/config/env.js';
import { buildPlanContext } from '../../src/core/permissoes/planos.catalog.js';

describe('PermissoesService', () => {
  const originalMode = env.deploymentMode;

  afterEach(() => {
    env.deploymentMode = originalMode;
  });

  test('resolve permissões a partir das roles', () => {
    const snapshot = PermissoesService.construirSnapshotPermissao({
      roles: ['modulo:estoque'],
      overrides: [],
    });

    expect(snapshot.effective_permissions).toContain('painel.acesso');
    expect(snapshot.effective_permissions).toContain('estoque.acesso');
  });

  test('allow explícito libera permissão sem role base', () => {
    const snapshot = PermissoesService.construirSnapshotPermissao({
      roles: [],
      overrides: [{ permission_key: 'usuarios.acesso', effect: 'allow' }],
    });

    expect(snapshot.effective_permissions).toContain('usuarios.acesso');
  });

  test('deny explícito bloqueia permissão mesmo com role base', () => {
    const snapshot = PermissoesService.construirSnapshotPermissao({
      roles: ['modulo:estoque'],
      overrides: [{ permission_key: 'estoque.acesso', effect: 'deny' }],
    });

    expect(snapshot.effective_permissions).not.toContain('estoque.acesso');
  });

  test('catálogo contém módulos gerenciáveis', () => {
    const catalog = PermissoesService.obterCatalogo();
    expect(catalog.modules.some((module) => module.key === 'servicos')).toBe(true);
    expect(catalog.permissions.some((permission) => permission.key === 'painel.acesso')).toBe(true);
  });

  test('modo LOCAL respeita permissões distintas de usuários internos', () => {
    env.deploymentMode = 'LOCAL';
    const access = buildPlanContext({ plan_key: 'free' });
    const snapshot = PermissoesService.construirSnapshotPermissao({
      roles: [],
      overrides: [{ permission_key: 'estoque.acesso', effect: 'allow' }],
      fullAccess: false,
      planPermissaoKeys: access.permission_keys,
      planContext: access,
    });

    expect(snapshot.effective_permissions).toContain('estoque.acesso');
    expect(snapshot.effective_permissions).not.toContain('configuracoes.acesso');
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

    expect(snapshot.effective_permissions).toContain('servicos.acesso');
    expect(snapshot.effective_permissions).toContain('usuarios.acesso');
    expect(snapshot.effective_permissions).toContain('estoque.acesso');
  });

  test('trial SaaS mantém acesso completo por 30 dias', () => {
    env.deploymentMode = 'SAAS';
    const access = buildPlanContext({
      plan_key: 'trial',
      subscription_status: 'trialing',
      trial_ends_at: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    });

    expect(access.trial.active).toBe(true);
    expect(access.permission_keys).toContain('estoque.acesso');
  });

  test('trial vencido cai para permissões do plano configurado', () => {
    env.deploymentMode = 'SAAS';
    const access = buildPlanContext({
      plan_key: 'free',
      subscription_status: 'trialing',
      trial_ends_at: new Date(Date.now() - 86_400_000).toISOString(),
    });
    const snapshot = PermissoesService.construirSnapshotPermissao({
      roles: ['modulo:estoque'],
      overrides: [],
      planPermissaoKeys: access.permission_keys,
      planContext: access,
    });

    expect(access.trial.active).toBe(false);
    expect(snapshot.effective_permissions).not.toContain('estoque.acesso');
  });
});
