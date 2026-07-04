import { Router } from 'express';
import ValidacaoMiddleware from '../../core/middlewares/validacao.middleware.js';
import EstoqueController from './estoque/estoque.controller.js';
import { stockCreateSchema } from './estoque/estoque.schema.js';
import PermissoesMiddleware from '../../core/middlewares/permissoes.middleware.js';
import VendasController from './vendas/vendas.controller.js';
import { saleCreateSchema } from './vendas/vendas.schema.js';
import GarantiasController from './garantias/garantias.controller.js';
import { servicePartWarrantyCreateSchema } from './garantias/garantias.schema.js';

const router = Router();

router.get('/estoque', PermissoesMiddleware.exigirPermissao('inventory.stock.access'), EstoqueController.obterTodos);
router.post(
  '/estoque',
  PermissoesMiddleware.exigirPermissao('inventory.stock.access'),
  ValidacaoMiddleware.validarSchema(stockCreateSchema),
  EstoqueController.criar,
);
router.put('/estoque/:id', PermissoesMiddleware.exigirPermissao('inventory.stock.access'), EstoqueController.atualizar);
router.delete('/estoque/:id', PermissoesMiddleware.exigirPermissao('inventory.stock.access'), EstoqueController.remover);

router.get('/vendas', PermissoesMiddleware.exigirPermissao('inventory.sales.access'), VendasController.listar);
router.get('/vendas/:id', PermissoesMiddleware.exigirPermissao('inventory.sales.access'), VendasController.obterPorId);
router.post(
  '/vendas',
  PermissoesMiddleware.exigirPermissao('inventory.sales.access'),
  ValidacaoMiddleware.validarSchema(saleCreateSchema),
  VendasController.criar,
);

router.get('/garantias', PermissoesMiddleware.exigirPermissao('inventory.warranties.access'), GarantiasController.listar);
router.get('/garantias/:id', PermissoesMiddleware.exigirPermissao('inventory.warranties.access'), GarantiasController.obterPorId);
router.post(
  '/servicos/:serviceId/pecas',
  PermissoesMiddleware.exigirPermissao('inventory.warranties.access'),
  ValidacaoMiddleware.validarSchema(servicePartWarrantyCreateSchema),
  GarantiasController.registrarPecaServico,
);

export default router;
