import { Router } from 'express';
import PermissoesMiddleware from '../../core/middlewares/permissoes.middleware.js';
import ValidacaoMiddleware from '../../core/middlewares/validacao.middleware.js';
import TiposProdutoController from './tipos-produto.controller.js';
import { typeProductCreateSchema } from './tipos-produto.schema.js';

const router = Router();

router.get('/tipos-produto', PermissoesMiddleware.exigirPermissao('tipos-produto.acesso'), TiposProdutoController.obterTodos);
router.post(
  '/tipos-produto',
  PermissoesMiddleware.exigirPermissao('tipos-produto.acesso'),
  ValidacaoMiddleware.validarSchema(typeProductCreateSchema),
  TiposProdutoController.criar,
);
router.delete('/tipos-produto/:id', PermissoesMiddleware.exigirPermissao('tipos-produto.acesso'), TiposProdutoController.remover);

export default router;
