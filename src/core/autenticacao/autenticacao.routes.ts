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
  authLoginSchema,
  authRegisterSchema,
  authResetPasswordSchema,
  authRefreshSchema,
  authVerifyEmailSchema,
  onboardingSchema,
} from './autenticacao.schema.js';

const router = Router();

router.get('/configuracao', AutenticacaoController.config);
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
  '/registrar',
  RateLimitMiddleware.cadastroPublico,
  SegurancaMiddleware.exigirOrigemConfiavel,
  ValidacaoMiddleware.validarSchema(authRegisterSchema),
  AutenticacaoController.registrar,
);
router.post(
  '/verificar-email',
  RateLimitMiddleware.authPadrao,
  SegurancaMiddleware.exigirOrigemConfiavel,
  ValidacaoMiddleware.validarSchema(authVerifyEmailSchema),
  AutenticacaoController.verificarEmail,
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
  RateLimitMiddleware.cadastroPublico,
  SegurancaMiddleware.exigirOrigemConfiavel,
  AutenticacaoMiddleware.autenticarToken,
  ValidacaoMiddleware.validarSchema(onboardingSchema),
  AutenticacaoController.concluirOnboarding,
);

export default router;
