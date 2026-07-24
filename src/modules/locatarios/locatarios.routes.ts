import { Router } from 'express';
import ValidacaoMiddleware from '../../core/middlewares/validacao.middleware.js';
import PermissoesMiddleware from '../../core/middlewares/permissoes.middleware.js';
import LocatariosController from './locatarios.controller.js';
import { tenantCreateSchema } from './locatarios.schema.js';

const router = Router();

router.get('/locatarios', PermissoesMiddleware.exigirPermissao('locatarios.acesso'), LocatariosController.obterTodos);
router.post(
  '/locatarios',
  PermissoesMiddleware.exigirPermissao('locatarios.acesso'),
  PermissoesMiddleware.exigirAdmin(),
  ValidacaoMiddleware.validarSchema(tenantCreateSchema),
  LocatariosController.criar,
);
router.delete(
  '/locatarios/:id',
  PermissoesMiddleware.exigirPermissao('locatarios.acesso'),
  PermissoesMiddleware.exigirAdmin(),
  LocatariosController.remover,
);

export default router;
