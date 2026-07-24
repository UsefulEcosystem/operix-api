import type { NextFunction, Request, RequestHandler, Response } from 'express';
import ManipuladorResposta from '../utils/manipulador-resposta.js';
import PermissoesService from '../permissoes/permissoes.service.js';

export default class PermissoesMiddleware {
  static exigirPermissao(permissionKey: string): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;

      if (!user) {
        return ManipuladorResposta.erro(res, 'Usuário não autenticado.', 401);
      }

      try {
        if (!Array.isArray(user.permissions)) {
          const snapshot = await PermissoesService.obterPermissoesUsuarioAtual(user);
          user.permissions = snapshot.effective_permissions;
          user.access = snapshot.access;
        }

        if (!PermissoesService.temPermissao(permissionKey, user.permissions)) {
          const definition = PermissoesService.obterDefinicaoPermissao(permissionKey);
          const label = definition?.label || permissionKey;
          return ManipuladorResposta.erro(res, `Acesso negado. Permissão necessária: ${label}`, 403);
        }

        next();
      } catch (error: any) {
        return ManipuladorResposta.erro(res, error.message || 'Erro ao validar permissões.', 500);
      }
    };
  }

  static exigirAdmin(): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;
      const isAdmin = Boolean(user?.admin || user?.root);

      if (!isAdmin) {
        return ManipuladorResposta.erro(res, 'Acesso restrito a usuários administradores.', 403);
      }

      next();
    };
  }
}
