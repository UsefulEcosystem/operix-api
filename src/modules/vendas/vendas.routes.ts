import { Router } from 'express';
import PermissoesMiddleware from '../../core/middlewares/permissoes.middleware.js';
import ValidacaoMiddleware from '../../core/middlewares/validacao.middleware.js';
import VendasController from './vendas.controller.js';
import { saleCreateSchema } from './vendas.schema.js';

const router = Router();

router.get('/vendas', PermissoesMiddleware.exigirPermissao('vendas.acesso'), VendasController.listar);
router.get('/vendas/:id', PermissoesMiddleware.exigirPermissao('vendas.acesso'), VendasController.obterPorId);
router.post(
  '/vendas',
  PermissoesMiddleware.exigirPermissao('vendas.acesso'),
  ValidacaoMiddleware.validarSchema(saleCreateSchema),
  VendasController.criar,
);

export default router;
