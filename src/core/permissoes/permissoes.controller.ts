import type { Request, Response } from 'express';
import ManipuladorResposta from '../utils/manipulador-resposta.js';
import PermissoesService from './permissoes.service.js';

export default class PermissoesController {
  static async obterCatalogo(_req: Request, res: Response) {
    return ManipuladorResposta.sucesso(res, PermissoesService.obterCatalogo(), 'Catálogo de permissões obtido com sucesso');
  }

  static async obterMeuPerfil(req: Request, res: Response) {
    const snapshot = await PermissoesService.obterPermissoesUsuarioAtual((req as any).user);
    return ManipuladorResposta.sucesso(res, {
      roles: (req as any).user?.roles || [],
      effective_permissions: snapshot.effective_permissions,
      permissions: snapshot.permissions,
      access: snapshot.access,
    }, 'Permissões do usuário autenticado obtidas com sucesso');
  }

  static async obterUsuario(req: Request, res: Response) {
    const data = await PermissoesService.obterPermissoesUsuarioParaGestao(Number(req.params.id), (req as any).user);
    return ManipuladorResposta.sucesso(res, data, 'Permissões do usuário obtidas com sucesso');
  }

  static async substituirSubstituicoesUsuario(req: Request, res: Response) {
    const data = await PermissoesService.substituirSubstituicoesUsuario(
      Number(req.params.id),
      (req as any).user,
      req.body.overrides,
    );

    return ManipuladorResposta.sucesso(res, data, 'Permissões do usuário atualizadas com sucesso');
  }
}
