import { Router } from 'express';
import ValidacaoMiddleware from '../middlewares/validacao.middleware.js';
import PermissoesMiddleware from '../middlewares/permissoes.middleware.js';
import PermissoesController from './permissoes.controller.js';
import { permissionOverridesUpdateSchema } from './permissoes.schema.js';

const router = Router();

router.get('/permissoes/me', PermissoesController.obterMeuPerfil);
router.get(
  '/permissoes/catalogo',
  PermissoesMiddleware.exigirPermissao('usuarios.acesso'),
  PermissoesMiddleware.exigirAdmin(),
  PermissoesController.obterCatalogo,
);
router.get(
  '/permissoes/usuarios/:id',
  PermissoesMiddleware.exigirPermissao('usuarios.acesso'),
  PermissoesMiddleware.exigirAdmin(),
  PermissoesController.obterUsuario,
);
router.put(
  '/permissoes/usuarios/:id',
  PermissoesMiddleware.exigirPermissao('usuarios.acesso'),
  PermissoesMiddleware.exigirAdmin(),
  ValidacaoMiddleware.validarSchema(permissionOverridesUpdateSchema),
  PermissoesController.substituirSubstituicoesUsuario,
);

export default router;
