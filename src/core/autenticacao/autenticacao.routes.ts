import { Router } from 'express';
import AutenticacaoController from './autenticacao.controller.js';
import ValidacaoMiddleware from '../../core/middlewares/validacao.middleware.js';
import AutenticacaoMiddleware from '../middlewares/autenticacao.middleware.js';
import RateLimitMiddleware from '../middlewares/rate-limit.middleware.js';
import SegurancaMiddleware from '../middlewares/seguranca.middleware.js';
import {
  authAuthorizeSchema,
  authCallbackSchema,
  authForgotPasswordSchema,
  authInternalLoginSchema,
  authLoginSchema,
  authRegisterSchema,
  authResetPasswordSchema,
  authRefreshSchema,
  authCheckEmailSchema,
  onboardingSchema,
} from './autenticacao.schema.js';
import AcessoExternoController from '../../modules/acesso-externo/acesso-externo.controller.js';
import { externalTokenSchema } from '../../modules/acesso-externo/acesso-externo.schema.js';

const router = Router();

router.post('/acesso-externo/trocar', ValidacaoMiddleware.validarSchema(externalTokenSchema), AcessoExternoController.trocar);

router.get('/configuracao', AutenticacaoController.config);

router.post(
  '/verificar-email-existencia',
  RateLimitMiddleware.authPadrao,
  SegurancaMiddleware.exigirOrigemConfiavel,
  ValidacaoMiddleware.validarSchema(authCheckEmailSchema),
  AutenticacaoController.checkEmail,
);

router.post(
  '/autorizar',
  RateLimitMiddleware.authPadrao,
  SegurancaMiddleware.exigirOrigemConfiavel,
  ValidacaoMiddleware.validarSchema(authAuthorizeSchema),
  AutenticacaoController.authorize,
);

router.post(
  '/retorno',
  RateLimitMiddleware.authEstrito,
  SegurancaMiddleware.exigirOrigemConfiavel,
  ValidacaoMiddleware.validarSchema(authCallbackSchema),
  AutenticacaoController.callback,
);

router.post(
  '/login',
  RateLimitMiddleware.authEstrito,
  SegurancaMiddleware.exigirOrigemConfiavel,
  ValidacaoMiddleware.validarSchema(authLoginSchema),
  AutenticacaoController.login,
);

router.post(
  '/login-interno',
  RateLimitMiddleware.authEstrito,
  SegurancaMiddleware.exigirOrigemConfiavel,
  ValidacaoMiddleware.validarSchema(authInternalLoginSchema),
  AutenticacaoController.loginInterno,
);

router.post(
  '/registrar',
  RateLimitMiddleware.cadastroPublico,
  SegurancaMiddleware.exigirOrigemConfiavel,
  ValidacaoMiddleware.validarSchema(authRegisterSchema),
  AutenticacaoController.registrar,
);

router.post(
  '/recuperar-senha',
  RateLimitMiddleware.authEstrito,
  SegurancaMiddleware.exigirOrigemConfiavel,
  ValidacaoMiddleware.validarSchema(authForgotPasswordSchema),
  AutenticacaoController.solicitarRecuperacaoSenha,
);

router.post(
  '/redefinir-senha',
  RateLimitMiddleware.authEstrito,
  SegurancaMiddleware.exigirOrigemConfiavel,
  ValidacaoMiddleware.validarSchema(authResetPasswordSchema),
  AutenticacaoController.redefinirSenha,
);

router.post(
  '/renovar',
  RateLimitMiddleware.authPadrao,
  SegurancaMiddleware.exigirOrigemConfiavel,
  ValidacaoMiddleware.validarSchema(authRefreshSchema),
  AutenticacaoController.renovarToken,
);

router.post(
  '/sair',
  RateLimitMiddleware.authPadrao,
  SegurancaMiddleware.exigirOrigemConfiavel,
  ValidacaoMiddleware.validarSchema(authRefreshSchema),
  AutenticacaoController.logout,
);

router.get('/eu', AutenticacaoMiddleware.autenticarToken, AutenticacaoController.me);

router.post(
  '/onboarding',
  RateLimitMiddleware.authPadrao,
  SegurancaMiddleware.exigirOrigemConfiavel,
  AutenticacaoMiddleware.autenticarToken,
  ValidacaoMiddleware.validarSchema(onboardingSchema),
  AutenticacaoController.concluirOnboarding,
);

export default router;
