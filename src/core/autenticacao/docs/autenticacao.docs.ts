import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  authAuthorizeResponseSchema,
  authAuthorizeSchema,
  authCallbackResponseSchema,
  authCallbackSchema,
  authConfigResponseSchema,
  authForgotPasswordSchema,
  authGenericResponseSchema,
  authLoginResponseSchema,
  authLoginSchema,
  authMeResponseSchema,
  authOnboardingResponseSchema,
  authRefreshResponseSchema,
  authRefreshSchema,
  authRegisterResponseSchema,
  authRegisterSchema,
  authResetPasswordSchema,
  authVerifyEmailSchema,
  onboardingSchema,
} from '../autenticacao.schema.js';

export function registerAuthDocs(registry: OpenAPIRegistry) {
  const security = [{ bearerAuth: [] }];

  registry.register('AuthAuthorize', authAuthorizeSchema);
  registry.register('AuthCallback', authCallbackSchema);
  registry.register('AuthLogin', authLoginSchema);
  registry.register('AuthRefresh', authRefreshSchema);
  registry.register('AuthRegister', authRegisterSchema);
  registry.register('AuthVerifyEmail', authVerifyEmailSchema);
  registry.register('AuthForgotPassword', authForgotPasswordSchema);
  registry.register('AuthResetPassword', authResetPasswordSchema);
  registry.register('Onboarding', onboardingSchema);

  registry.registerPath({
    method: 'get',
    path: '/autenticacao/configuracao',
    tags: ['Autenticação'],
    responses: {
      200: {
        description: 'Configuração pública de autenticação carregada com sucesso',
        content: { 'application/json': { schema: authConfigResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/autenticacao/autorizar',
    tags: ['Autenticação'],
    request: { body: { content: { 'application/json': { schema: authAuthorizeSchema } }, required: true } },
    responses: {
      200: {
        description: 'URL de autenticação gerada com sucesso',
        content: { 'application/json': { schema: authAuthorizeResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/autenticacao/retorno',
    tags: ['Autenticação'],
    request: { body: { content: { 'application/json': { schema: authCallbackSchema } }, required: true } },
    responses: {
      200: {
        description: 'Callback do provedor autenticado com sucesso',
        content: { 'application/json': { schema: authCallbackResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/autenticacao/login',
    tags: ['Autenticação'],
    request: { body: { content: { 'application/json': { schema: authLoginSchema } }, required: true } },
    responses: {
      200: {
        description: 'Login realizado com sucesso',
        content: { 'application/json': { schema: authLoginResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/autenticacao/registrar',
    tags: ['Autenticação'],
    request: { body: { content: { 'application/json': { schema: authRegisterSchema } }, required: true } },
    responses: {
      201: {
        description: 'Cadastro iniciado com verificação de e-mail',
        content: { 'application/json': { schema: authRegisterResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/autenticacao/verificar-email',
    tags: ['Autenticação'],
    request: { body: { content: { 'application/json': { schema: authVerifyEmailSchema } }, required: true } },
    responses: {
      200: {
        description: 'E-mail verificado e sessão iniciada',
        content: { 'application/json': { schema: authLoginResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/autenticacao/recuperar-senha',
    tags: ['Autenticação'],
    request: { body: { content: { 'application/json': { schema: authForgotPasswordSchema } }, required: true } },
    responses: {
      200: {
        description: 'Solicitação de recuperação aceita',
        content: { 'application/json': { schema: authGenericResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/autenticacao/redefinir-senha',
    tags: ['Autenticação'],
    request: { body: { content: { 'application/json': { schema: authResetPasswordSchema } }, required: true } },
    responses: {
      200: {
        description: 'Senha redefinida com sucesso',
        content: { 'application/json': { schema: authGenericResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/autenticacao/renovar',
    tags: ['Autenticação'],
    request: { body: { content: { 'application/json': { schema: authRefreshSchema } }, required: true } },
    responses: {
      200: {
        description: 'Refresh token realizado com sucesso',
        content: { 'application/json': { schema: authRefreshResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/autenticacao/sair',
    tags: ['Autenticação'],
    request: { body: { content: { 'application/json': { schema: authRefreshSchema } }, required: true } },
    responses: {
      200: {
        description: 'Logout realizado com sucesso',
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/autenticacao/eu',
    tags: ['Autenticação'],
    security,
    responses: {
      200: {
        description: 'Sessão autenticada carregada com sucesso',
        content: { 'application/json': { schema: authMeResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/autenticacao/onboarding',
    tags: ['Autenticação'],
    security,
    request: { body: { content: { 'application/json': { schema: onboardingSchema } }, required: true } },
    responses: {
      201: {
        description: 'Onboarding concluído com sucesso',
        content: { 'application/json': { schema: authOnboardingResponseSchema } },
      },
    },
  });
}
