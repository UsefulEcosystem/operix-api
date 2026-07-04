import ErroValidacao from '../../utils/erro-validacao.js';
import { sanitizarUsuario } from '../../utils/sanitizar.js';
import UsuariosRepository from '../usuarios/usuarios.repository.js';
import PermissoesRepository from './permissoes.repository.js';
import LocatarioRepository from '../locatarios/locatarios.repository.js';
import { env } from '../../config/env.js';
import {
  getManageableModuleCatalog,
  obterCatalogooPermissao,
  obterCatalogooPermissaoItem,
  getPermissaoKeysForRoles,
  isPermissaoKey,
} from './permissoes.catalog.js';
import { buildPlanContext, getPlanCatalog } from './planos.catalog.js';

type SubstituicaoPermissao = {
  permission_key: string;
  effect: 'allow' | 'deny';
};

type AuthenticatedUser = {
  id?: number | null;
  tenant_id?: number | null;
  roles?: string[];
  permissions?: string[];
  admin?: boolean | null;
  root?: boolean | null;
  name?: string | null;
  username?: string | null;
  email?: string | null;
};

type AccessPlanContext = ReturnType<typeof buildPlanContext> & {
  tenant_name?: string;
  company_name?: string;
  tenant_logo_url?: string;
  company_logo_url?: string;
  tenant_id?: number;
};

export default class PermissoesService {
  static obterCatalogo() {
    const permissions = obterCatalogooPermissao();
    const modules = getManageableModuleCatalog().map((module) => ({
      ...module,
      permissions: permissions.filter((permission) => permission.module_key === module.key),
    }));

    return { modules, permissions, plans: getPlanCatalog() };
  }

  static async obterPermissoesUsuarioAtual(user: AuthenticatedUser) {
    const tenant = user.tenant_id ? await LocatarioRepository.findById(user.tenant_id) : null;
    const planContext: AccessPlanContext = buildPlanContext(tenant);
    if (tenant?.name) {
      planContext.tenant_name = tenant.name;
      planContext.company_name = tenant.name;
    }
    if (tenant?.logo_url) {
      planContext.tenant_logo_url = tenant.logo_url;
      planContext.company_logo_url = tenant.logo_url;
    }
    if (tenant?.id) {
      planContext.tenant_id = tenant.id;
    }
    const overrides = user.id ? await PermissoesRepository.getOverridesByUserId(user.id) : [];

    return this.construirSnapshotPermissao({
      roles: this.obterRolesLocais(user),
      overrides,
      planPermissaoKeys: planContext.permission_keys,
      fullAccess: env.deploymentMode === 'LOCAL' || Boolean(user.root) || Boolean(user.admin),
      planContext,
    });
  }

  static async obterPermissoesUsuarioParaGestao(usuarioAlvoId: number, actor: AuthenticatedUser) {
    if (!actor.tenant_id) {
      throw new ErroValidacao('Tenant do usuário autenticado não encontrado.', 422);
    }

    const usuarioAlvo = await UsuariosRepository.findByIdAndTenantId(usuarioAlvoId, actor.tenant_id);
    if (!usuarioAlvo) {
      throw new ErroValidacao('Usuário não encontrado.', 404);
    }

    const roles = this.obterRolesLocais(usuarioAlvo);
    const overrides = await PermissoesRepository.getOverridesByUserId(usuarioAlvoId);
    const tenant = await LocatarioRepository.findById(actor.tenant_id);
    const planContext: AccessPlanContext = buildPlanContext(tenant);
    if (tenant?.name) {
      planContext.tenant_name = tenant.name;
      planContext.company_name = tenant.name;
    }
    if (tenant?.logo_url) {
      planContext.tenant_logo_url = tenant.logo_url;
      planContext.company_logo_url = tenant.logo_url;
    }
    if (tenant?.id) {
      planContext.tenant_id = tenant.id;
    }
    const snapshot = this.construirSnapshotPermissao({
      roles,
      overrides,
      planPermissaoKeys: planContext.permission_keys,
      fullAccess: env.deploymentMode === 'LOCAL' || Boolean(usuarioAlvo.root),
      planContext,
    });

    return {
      user: sanitizarUsuario(usuarioAlvo),
      roles,
      module_roles: roles.filter((role) => role.startsWith('module:')),
      overrides,
      effective_permissions: snapshot.effective_permissions,
      permissions: snapshot.permissions,
      access: snapshot.access,
    };
  }

  static async substituirSubstituicoesUsuario(usuarioAlvoId: number, actor: AuthenticatedUser, overrides: SubstituicaoPermissao[]) {
    if (!actor.tenant_id) {
      throw new ErroValidacao('Tenant do usuário autenticado não encontrado.', 422);
    }

    const usuarioAlvo = await UsuariosRepository.findByIdAndTenantId(usuarioAlvoId, actor.tenant_id);
    if (!usuarioAlvo) {
      throw new ErroValidacao('Usuário não encontrado.', 404);
    }

    overrides.forEach((override) => {
      if (!isPermissaoKey(override.permission_key)) {
        throw new ErroValidacao(`Permissão inválida: ${override.permission_key}`, 400);
      }
    });

    await PermissoesRepository.replaceOverrides(usuarioAlvoId, overrides);
    return this.obterPermissoesUsuarioParaGestao(usuarioAlvoId, actor);
  }

  static construirSnapshotPermissao({
    roles = [],
    overrides = [],
    planPermissaoKeys,
    fullAccess = false,
    planContext = null,
  }: {
    roles?: string[];
    overrides?: SubstituicaoPermissao[];
    planPermissaoKeys?: string[];
    fullAccess?: boolean;
    planContext?: any;
  }) {
    const rolePermissaos = new Set(getPermissaoKeysForRoles(roles));
    const overrideMap = new Map(overrides.map((override) => [override.permission_key, override.effect]));
    const planPermissaos = new Set(planPermissaoKeys || obterCatalogooPermissao().map((permission) => permission.key));

    const permissions = obterCatalogooPermissao().map((permission) => {
      const effect = overrideMap.get(permission.key);
      const blockedByPlan = !fullAccess && !planPermissaos.has(permission.key);

      if (fullAccess) {
        return {
          ...permission,
          allowed: true,
          source: env.deploymentMode === 'LOCAL' ? ('deployment:local' as const) : ('role' as const),
        };
      }

      if (effect === 'deny') {
        return {
          ...permission,
          allowed: false,
          source: 'override:deny' as const,
        };
      }

      if (effect === 'allow') {
        if (blockedByPlan) {
          return {
            ...permission,
            allowed: false,
            source: 'plan' as const,
          };
        }

        return {
          ...permission,
          allowed: true,
          source: 'override:allow' as const,
        };
      }

      if (rolePermissaos.has(permission.key)) {
        if (blockedByPlan) {
          return {
            ...permission,
            allowed: false,
            source: 'plan' as const,
          };
        }

        return {
          ...permission,
          allowed: true,
          source: permission.key === 'dashboard.access' ? ('authenticated' as const) : ('role' as const),
        };
      }

      return {
        ...permission,
        allowed: false,
        source: 'none' as const,
      };
    });

    return {
      effective_permissions: permissions.filter((permission) => permission.allowed).map((permission) => permission.key),
      permissions,
      access: planContext,
    };
  }

  static temPermissao(permissionKey: string, userPermissaos: string[] = []) {
    return userPermissaos.includes(permissionKey);
  }

  static obterDefinicaoPermissao(permissionKey: string) {
    return obterCatalogooPermissaoItem(permissionKey);
  }

  static obterRolesLocais(user: AuthenticatedUser) {
    if (user.roles?.length) {
      return user.roles;
    }

    if (!user.admin && !user.root) {
      return [];
    }

    return getManageableModuleCatalog()
      .map((module) => module.role_key)
      .filter((roleKey): roleKey is string => Boolean(roleKey));
  }
}
