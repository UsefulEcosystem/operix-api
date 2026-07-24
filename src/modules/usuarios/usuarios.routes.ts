import { Router } from 'express';
import ValidacaoMiddleware from '../../core/middlewares/validacao.middleware.js';
import PermissoesMiddleware from '../../core/middlewares/permissoes.middleware.js';
import UsuariosController from './usuarios.controller.js';
import { userAccessUpdateSchema, userCreateSchema } from './usuarios.schema.js';

const router = Router();

router.get('/usuarios', PermissoesMiddleware.exigirPermissao('usuarios.acesso'), UsuariosController.obterTodos);
router.post(
  '/usuarios',
  PermissoesMiddleware.exigirPermissao('usuarios.acesso'),
  PermissoesMiddleware.exigirAdmin(),
  ValidacaoMiddleware.validarSchema(userCreateSchema),
  UsuariosController.criar,
);
router.delete(
  '/usuarios/:id',
  PermissoesMiddleware.exigirPermissao('usuarios.acesso'),
  PermissoesMiddleware.exigirAdmin(),
  UsuariosController.remover,
);
router.patch(
  '/usuarios/:id/acesso',
  PermissoesMiddleware.exigirPermissao('usuarios.acesso'),
  PermissoesMiddleware.exigirAdmin(),
  ValidacaoMiddleware.validarSchema(userAccessUpdateSchema),
  UsuariosController.atualizarAcesso,
);

export default router;
