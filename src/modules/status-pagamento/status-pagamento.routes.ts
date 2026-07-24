import { Router } from 'express';
import PermissoesMiddleware from '../../core/middlewares/permissoes.middleware.js';
import ValidacaoMiddleware from '../../core/middlewares/validacao.middleware.js';
import StatusPagamentoController from './status-pagamento.controller.js';
import { statusPaymentCreateSchema } from './status-pagamento.schema.js';

const router = Router();

router.get('/status-pagamento', PermissoesMiddleware.exigirPermissao('status-pagamento.acesso'), StatusPagamentoController.obterTodos);
router.post(
  '/status-pagamento',
  PermissoesMiddleware.exigirPermissao('status-pagamento.acesso'),
  ValidacaoMiddleware.validarSchema(statusPaymentCreateSchema),
  StatusPagamentoController.criar,
);
router.delete('/status-pagamento/:id', PermissoesMiddleware.exigirPermissao('status-pagamento.acesso'), StatusPagamentoController.remover);

export default router;
