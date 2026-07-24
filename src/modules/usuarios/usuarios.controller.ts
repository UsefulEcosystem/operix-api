import type { Request, Response } from 'express';
import ManipuladorResposta from '../../core/utils/manipulador-resposta.js';
import UsuarioModel from './usuarios.model.js';
import UsuariosService from './usuarios.service.js';

export default class UsuariosController {
  static async obterTodos(req: Request, res: Response) {
    const { tenant_id: tenantId } = (req as any).user;
    return ManipuladorResposta.sucesso(res, await UsuariosService.obterTodos(tenantId), 'Usuários listados com sucesso');
  }

  static async criar(req: Request, res: Response) {
    const createdUser = await UsuariosService.criar(
      UsuarioModel.deRequisicao(req.body),
      (req as any).user,
      req.body.modules,
    );

    return ManipuladorResposta.sucesso(res, createdUser, 'Usuário criado com sucesso', 201);
  }

  static async remover(req: Request, res: Response) {
    const { tenant_id: tenantId } = (req as any).user;
    const user = UsuarioModel.deParametrosRequisicao(req.params);
    await UsuariosService.remover(user, tenantId);
    return ManipuladorResposta.sucesso(res, null, 'Usuário removido com sucesso', 204);
  }

  static async atualizarAcesso(req: Request, res: Response) {
    const data = await UsuariosService.atualizarAcesso(Number(req.params.id), (req as any).user, UsuarioModel.deRequisicao(req.body));
    return ManipuladorResposta.sucesso(res, data, 'Usuário atualizado com sucesso');
  }
}
