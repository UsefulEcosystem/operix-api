import { Router } from 'express';
import PermissoesMiddleware from '../../core/middlewares/permissoes.middleware.js';
import ValidacaoMiddleware from '../../core/middlewares/validacao.middleware.js';
import PecasServicoController from './pecas-servico.controller.js';
import { servicePartCreateSchema } from './pecas-servico.schema.js';

const router = Router();

router.post(
  '/servicos/:serviceId/pecas',
  PermissoesMiddleware.exigirPermissao('servicos.acesso'),
  PermissoesMiddleware.exigirPermissao('estoque.acesso'),
  ValidacaoMiddleware.validarSchema(servicePartCreateSchema),
  PecasServicoController.registrar,
);

export default router;
