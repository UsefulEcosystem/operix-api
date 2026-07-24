import { Router } from 'express';
import PermissoesMiddleware from '../../core/middlewares/permissoes.middleware.js';
import ValidacaoMiddleware from '../../core/middlewares/validacao.middleware.js';
import EstoqueController from './estoque.controller.js';
import { stockCreateSchema, stockUpdateSchema } from './estoque.schema.js';

const router = Router();

router.get('/estoque', PermissoesMiddleware.exigirPermissao('estoque.acesso'), EstoqueController.obterTodos);
router.post(
  '/estoque',
  PermissoesMiddleware.exigirPermissao('estoque.acesso'),
  ValidacaoMiddleware.validarSchema(stockCreateSchema),
  EstoqueController.criar,
);
router.put(
  '/estoque/:id',
  PermissoesMiddleware.exigirPermissao('estoque.acesso'),
  ValidacaoMiddleware.validarSchema(stockUpdateSchema),
  EstoqueController.atualizar,
);
router.delete('/estoque/:id', PermissoesMiddleware.exigirPermissao('estoque.acesso'), EstoqueController.remover);

export default router;
