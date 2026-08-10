import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../../core/config/env.js';
import ErroValidacao from '../../core/utils/erro-validacao.js';
import PermissoesService from '../../core/permissoes/permissoes.service.js';
import AcessoExternoRepository from './acesso-externo.repository.js';
import UsuariosRepository from '../usuarios/usuarios.repository.js';

export default class AcessoExternoService {
  static async meuLink(userId: number, tenantId: number) {
    const current = await AcessoExternoRepository.buscarAtual(userId, tenantId);
    if (!current?.token) return null;
    return { id: current.id, token_prefix: current.token_prefix, created_at: current.created_at, url: `${env.frontendUrl.replace(/\/+$/, '')}/#/painel-externo?token=${encodeURIComponent(current.token)}` };
  }
  static async criarLink(userId: number, tenantId: number) {
    const user = await UsuariosRepository.findByIdAndTenantId(userId, tenantId);
    if (!user || !user.active) throw new ErroValidacao('Usuário não encontrado ou inativo.', 404);
    const permissions = (await PermissoesService.obterPermissoesUsuarioAtual(user)).effective_permissions;
    if (!PermissoesService.temPermissao('servicos.acesso', permissions)) throw new ErroValidacao('O usuário precisa ter acesso ao módulo de serviços.', 422);
    const token = await AcessoExternoRepository.rotacionar(userId, tenantId);
    return { ...token, url: `${env.frontendUrl.replace(/\/+$/, '')}/#/painel-externo?token=${encodeURIComponent(token.token)}` };
  }

  static async trocar(token: string) {
    if (!token || token.length < 32) throw new ErroValidacao('Link externo inválido.', 401);
    const access = await AcessoExternoRepository.buscarAtivo(token);
    if (!access || !access.user_active) throw new ErroValidacao('Link externo inválido, revogado ou usuário inativo.', 401);
    const user = await UsuariosRepository.findById(access.user_id);
    const permissions = (await PermissoesService.obterPermissoesUsuarioAtual(user)).effective_permissions;
    if (!PermissoesService.temPermissao('servicos.acesso', permissions)) throw new ErroValidacao('O usuário não possui acesso ao módulo de serviços.', 403);
    const jti = crypto.randomUUID();
    const signed = jwt.sign({ sub: String(access.user_id), tenant_id: access.tenant_id, username: access.username, external: true, external_access_version: access.external_access_version, jti }, env.jwtSecret, { algorithm: 'HS256', issuer: env.jwtIssuer, audience: env.jwtAudience });
    return { token: signed, user: { id: access.user_id, name: access.name, username: access.username, tenant_id: access.tenant_id }, expires_in: null };
  }
}
