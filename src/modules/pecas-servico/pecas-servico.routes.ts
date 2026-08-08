import { Router } from 'express';
import PermissoesMiddleware from '../../core/middlewares/permissoes.middleware.js';
import ValidacaoMiddleware from '../../core/middlewares/validacao.middleware.js';
import PecasServicoController from './pecas-servico.controller.js';
import { servicePartCreateSchema } from './pecas-servico.schema.js';

const router = Router();

router.get(
  '/servicos/:serviceId/pecas',
  PermissoesMiddleware.exigirPermissao('servicos.acesso'),
  PecasServicoController.listar,
);

router.post(
  '/servicos/:serviceId/pecas',
  PermissoesMiddleware.exigirPermissao('servicos.acesso'),
  PermissoesMiddleware.exigirPermissao('estoque.acesso'),
  ValidacaoMiddleware.validarSchema(servicePartCreateSchema),
  PecasServicoController.registrar,
);

router.delete(
  '/servicos/:serviceId/pecas/:partId',
  PermissoesMiddleware.exigirPermissao('servicos.acesso'),
  PermissoesMiddleware.exigirPermissao('estoque.acesso'),
  PecasServicoController.remover,
);

export default router;
