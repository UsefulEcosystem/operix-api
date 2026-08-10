import type { Request, Response } from 'express';
import ManipuladorResposta from '../../core/utils/manipulador-resposta.js';
import FornecedoresService from './fornecedores.service.js';
export default class FornecedoresController {
  static async listar(req: Request, res: Response) { return ManipuladorResposta.sucesso(res, await FornecedoresService.listar((req as any).user.tenant_id), 'Fornecedores listados com sucesso'); }
  static async criar(req: Request, res: Response) { return ManipuladorResposta.sucesso(res, await FornecedoresService.criar((req as any).user.tenant_id, req.body), 'Fornecedor criado com sucesso', 201); }
  static async atualizar(req: Request, res: Response) { return ManipuladorResposta.sucesso(res, await FornecedoresService.atualizar(Number(req.params.id), (req as any).user.tenant_id, req.body), 'Fornecedor atualizado com sucesso'); }
  static async remover(req: Request, res: Response) { await FornecedoresService.remover(Number(req.params.id), (req as any).user.tenant_id); return ManipuladorResposta.sucesso(res, null, 'Fornecedor removido com sucesso', 204); }
}
