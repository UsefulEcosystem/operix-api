import type { Request, Response } from 'express';
import ManipuladorResposta from '../../core/utils/manipulador-resposta.js';
import PermissoesService from '../../core/permissoes/permissoes.service.js';
import LocatarioRepository from '../locatarios/locatarios.repository.js';
import LocatariosService from '../locatarios/locatarios.service.js';
import LocatarioModel from '../locatarios/locatarios.model.js';
import UsuariosService from '../usuarios/usuarios.service.js';
import UsuarioModel from '../usuarios/usuarios.model.js';
import { sanitizarUsuario } from '../../core/utils/sanitizar.js';

export default class ConfiguracoesPerfilController {
  static async obterMeuPerfil(req: Request, res: Response) {
    return ManipuladorResposta.sucesso(res, sanitizarUsuario((req as any).user), 'Perfil carregado com sucesso');
  }

  static async atualizarMeuPerfil(req: Request, res: Response) {
    const data = await UsuariosService.atualizarPerfilProprio((req as any).user, UsuarioModel.deRequisicao(req.body));
    return ManipuladorResposta.sucesso(res, data, 'Perfil atualizado com sucesso');
  }

  static async obterEmpresa(req: Request, res: Response) {
    const tenantId = (req as any).user?.tenant_id;
    const tenant = tenantId ? await LocatarioRepository.findById(tenantId) : null;
    return ManipuladorResposta.sucesso(res, tenant, 'Empresa carregada com sucesso');
  }

  static async atualizarEmpresa(req: Request, res: Response) {
    const tenantId = (req as any).user?.tenant_id;
    const tenant = await LocatariosService.atualizar(tenantId, LocatarioModel.deRequisicao(req.body));
    return ManipuladorResposta.sucesso(res, tenant, 'Empresa atualizada com sucesso');
  }

  static async obterSistema(req: Request, res: Response) {
    const snapshot = await PermissoesService.obterPermissoesUsuarioAtual((req as any).user);
    return ManipuladorResposta.sucesso(res, {
      access: snapshot.access,
      effective_permissions: snapshot.effective_permissions,
      permissions: snapshot.permissions,
      catalog: PermissoesService.obterCatalogo(),
    }, 'Configurações do sistema carregadas com sucesso');
  }
}
