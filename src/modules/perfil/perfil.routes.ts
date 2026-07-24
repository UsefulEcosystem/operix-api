import { Router } from 'express';
import ValidacaoMiddleware from '../../core/middlewares/validacao.middleware.js';
import PermissoesMiddleware from '../../core/middlewares/permissoes.middleware.js';
import ConfiguracoesPerfilController from './configuracoes-perfil.controller.js';
import { companySettingsUpdateSchema, userProfileUpdateSchema } from './configuracoes-perfil.schema.js';

const router = Router();

router.get('/perfil/eu', ConfiguracoesPerfilController.obterMeuPerfil);
router.patch(
  '/perfil/eu',
  ValidacaoMiddleware.validarSchema(userProfileUpdateSchema),
  ConfiguracoesPerfilController.atualizarMeuPerfil,
);
router.get(
  '/perfil/empresa',
  PermissoesMiddleware.exigirPermissao('configuracoes.acesso'),
  PermissoesMiddleware.exigirAdmin(),
  ConfiguracoesPerfilController.obterEmpresa,
);
router.patch(
  '/perfil/empresa',
  PermissoesMiddleware.exigirPermissao('configuracoes.acesso'),
  PermissoesMiddleware.exigirAdmin(),
  ValidacaoMiddleware.validarSchema(companySettingsUpdateSchema),
  ConfiguracoesPerfilController.atualizarEmpresa,
);
router.get('/perfil/sistema', ConfiguracoesPerfilController.obterSistema);

export default router;
