import { Router } from 'express';
import PermissoesMiddleware from '../../core/middlewares/permissoes.middleware.js';
import ValidacaoMiddleware from '../../core/middlewares/validacao.middleware.js';
import StatusServicoController from './status-servico.controller.js';
import { statusServiceCreateSchema } from './status-servico.schema.js';

const router = Router();

router.get('/status-servico', PermissoesMiddleware.exigirPermissao('status-servico.acesso'), StatusServicoController.obterTodos);
router.post(
  '/status-servico',
  PermissoesMiddleware.exigirPermissao('status-servico.acesso'),
  ValidacaoMiddleware.validarSchema(statusServiceCreateSchema),
  StatusServicoController.criar,
);
router.delete('/status-servico/:id', PermissoesMiddleware.exigirPermissao('status-servico.acesso'), StatusServicoController.remover);

export default router;
