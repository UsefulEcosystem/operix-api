import type { Request, Response } from 'express';
import ManipuladorResposta from '../../core/utils/manipulador-resposta.js';
import LocatarioModel from './locatarios.model.js';
import LocatariosService from './locatarios.service.js';

export default class LocatariosController {
  static async obterTodos(_req: Request, res: Response) {
    return ManipuladorResposta.sucesso(res, await LocatariosService.obterTodos(), 'Unidades listadas com sucesso');
  }

  static async criar(req: Request, res: Response) {
    const tenantData = LocatarioModel.deRequisicao(req.body);
    const createdTenant = await LocatariosService.criar(tenantData);
    return ManipuladorResposta.sucesso(res, createdTenant, 'Unidade criada com sucesso', 201);
  }

  static async remover(req: Request, res: Response) {
    await LocatariosService.remover(Number(req.params.id));
    return ManipuladorResposta.sucesso(res, null, 'Unidade removida com sucesso', 204);
  }
}
