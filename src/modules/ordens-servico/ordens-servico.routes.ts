import { Router } from 'express';
import PermissoesMiddleware from '../../core/middlewares/permissoes.middleware.js';
import ValidacaoMiddleware from '../../core/middlewares/validacao.middleware.js';
import OrdemServicoController from './ordem-servico.controller.js';
import { orderUpdateEstimateSchema } from './ordem-servico.schema.js';

const router = Router();

router.get('/ordens-servico', PermissoesMiddleware.exigirPermissao('servicos.acesso'), OrdemServicoController.obterTodos);
router.get('/ordens-servico/:cod', PermissoesMiddleware.exigirPermissao('servicos.acesso'), OrdemServicoController.obterUnico);
router.put(
  '/ordens-servico/:cod/orcamento',
  PermissoesMiddleware.exigirPermissao('servicos.acesso'),
  ValidacaoMiddleware.validarSchema(orderUpdateEstimateSchema),
  OrdemServicoController.atualizarOrcamento,
);
router.delete(
  '/ordens-servico/:cod/orcamento/:idEstimate',
  PermissoesMiddleware.exigirPermissao('servicos.acesso'),
  OrdemServicoController.removerOrcamento,
);

export default router;
