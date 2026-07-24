import ErroValidacao from '../../core/utils/erro-validacao.js';
import type UsuarioModel from './usuarios.model.js';
import UsuariosRepository from './usuarios.repository.js';
import LocatariosRepository from '../locatarios/locatarios.repository.js';
import argon2 from 'argon2';
import { obterCatalogooPermissao } from '../../core/permissoes/permissoes.catalog.js';
import PermissoesRepository from '../../core/permissoes/permissoes.repository.js';
import { sanitizarUsuario } from '../../core/utils/sanitizar.js';

export default class UsuariosService {
  static async obterTodos(tenantId: number) {
    return UsuariosRepository.obterTodos(tenantId);
  }

  static async criar(
    user: UsuarioModel,
    actor: { tenant_id?: number | null },
    moduleKeys: string[] = [],
  ) {
    if (!actor.tenant_id) {
      throw new ErroValidacao('Tenant do usuário autenticado não encontrado.', 422);
    }

    const tenant = await LocatariosRepository.findById(actor.tenant_id);
    if (!tenant) {
      throw new ErroValidacao('Unidade do usuário autenticado não encontrada.', 404);
    }

    const normalizedEmail = user.email?.trim().toLowerCase() || null;
    const existingEmail = normalizedEmail
      ? await UsuariosRepository.findByEmail(normalizedEmail)
      : null;
    if (existingEmail) {
      throw new ErroValidacao('E-mail já cadastrado.', 409);
    }

    const normalizedUsername = user.username.trim();
    const existingUsername = await UsuariosRepository.findByUsernameInTenant(normalizedUsername, tenant.id);
    if (existingUsername) {
      throw new ErroValidacao('Nome de usuário já utilizado nesta empresa.', 409);
    }

    const passwordHash = await argon2.hash(user.password || '');

    const persistedUser = await UsuariosRepository.criar({
      ...user,
      username: normalizedUsername,
      email: normalizedEmail,
      tenant: tenant.name,
      tenant_id: tenant.id,
      password: passwordHash,
    } as UsuarioModel);

    if (!persistedUser.admin && moduleKeys.length > 0) {
      await PermissoesRepository.replaceOverrides(
        persistedUser.id,
        this.resolveModuleOverrides(moduleKeys),
      );
    }

    return sanitizarUsuario(persistedUser);
  }

  static async remover(user: UsuarioModel, tenantId: number) {
    const result = await UsuariosRepository.getById(user, tenantId);

    if (!result || result.length === 0) {
      throw new ErroValidacao('Usuário não encontrado.', 404);
    }

    if (result[0].admin === true) {
      throw new ErroValidacao('Usuário administrador não pode ser removido.', 422);
    }

    return UsuariosRepository.remover(user, tenantId);
  }

  static async atualizarAcesso(
    usuarioAlvoId: number,
    actor: { tenant_id?: number | null; id?: number | null; root?: boolean | null },
    data: Partial<UsuarioModel>,
  ) {
    if (!actor.tenant_id) {
      throw new ErroValidacao('Tenant do usuário autenticado não encontrado.', 422);
    }

    const usuarioAlvo = await UsuariosRepository.findByIdAndTenantId(usuarioAlvoId, actor.tenant_id);
    if (!usuarioAlvo) {
      throw new ErroValidacao('Usuário não encontrado.', 404);
    }

    if (usuarioAlvo.root && !actor.root) {
      throw new ErroValidacao('Somente o proprietário pode alterar outro proprietário.', 403);
    }

    const updated = await UsuariosRepository.atualizarAcessoUsuario(usuarioAlvoId, actor.tenant_id, data);
    return sanitizarUsuario(updated);
  }

  static async atualizarPerfilProprio(
    actor: { tenant_id?: number | null; id?: number | null },
    data: Partial<UsuarioModel>,
  ) {
    if (!actor.tenant_id || !actor.id) {
      throw new ErroValidacao('Usuário autenticado não encontrado.', 422);
    }

    const updated = await UsuariosRepository.atualizarPerfil(actor.id, actor.tenant_id, data);
    if (!updated) {
      throw new ErroValidacao('Usuário não encontrado.', 404);
    }

    return sanitizarUsuario(updated);
  }

  private static resolveModuleOverrides(moduleKeys: string[]) {
    const selectedModules = new Set(moduleKeys);
    return obterCatalogooPermissao()
      .filter((permission) => selectedModules.has(permission.module_key))
      .map((permission) => ({
        permission_key: permission.key,
        effect: 'allow' as const,
      }));
  }
}
