import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { buildApiResponseSchema } from '../schemas/api-response.schema.js';
import { sanitizedUserSchema } from '../perfil/usuarios/usuarios.schema.js';

extendZodWithOpenApi(z);

const authLoginSchema = z.object({
  username: z.string().min(1, 'Campo "Nome de Usuário" é obrigatório.'),
  password: z.string().min(1, 'Campo "Senha" é obrigatório.'),
  remember: z.boolean().optional(),
}).openapi('AuthLogin');

const authRefreshSchema = z.object({
  refresh_token: z.string().min(1).optional(),
}).optional().default({}).openapi('AuthRefresh');

const authAuthorizeSchema = z.object({
  redirect_uri: z.string().url('Campo "redirect_uri" inválido.'),
  state: z.string().min(1, 'Campo "state" é obrigatório.'),
  code_challenge: z.string().min(16, 'Campo "code_challenge" é obrigatório.'),
  identity_provider: z.literal('google').optional().default('google'),
}).openapi('AuthAuthorize');

const authCallbackSchema = z.object({
  code: z.string().min(1, 'Campo "code" é obrigatório.'),
  redirect_uri: z.string().url('Campo "redirect_uri" inválido.'),
  code_verifier: z.string().min(16, 'Campo "code_verifier" é obrigatório.'),
}).openapi('AuthCallback');

const authRegisterSchema = z.object({
  email: z.string().email('Campo "E-mail" inválido.'),
}).openapi('AuthRegister');

const authSetupPasswordSchema = z.object({
  token: z.string().min(32, 'Token de verificação inválido.'),
  password: z.string().min(8, 'Campo "Senha" deve ter no mínimo 8 caracteres.'),
  confirm_password: z.string().min(8, 'Campo "Confirmar senha" deve ter no mínimo 8 caracteres.'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'As senhas informadas não conferem.',
  path: ['confirm_password'],
}).openapi('AuthSetupPassword');

const authVerifyEmailSchema = z.object({
  token: z.string().min(32, 'Token de verificação inválido.'),
}).openapi('AuthVerifyEmail');

const authForgotPasswordSchema = z.object({
  email: z.string().email('Campo "E-mail" inválido.'),
}).openapi('AuthForgotPassword');

const authResetPasswordSchema = z.object({
  token: z.string().min(32, 'Token de recuperação inválido.'),
  password: z.string().min(8, 'Campo "Senha" deve ter no mínimo 8 caracteres.'),
  confirm_password: z.string().min(8, 'Campo "Confirmar senha" deve ter no mínimo 8 caracteres.'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'As senhas informadas não conferem.',
  path: ['confirm_password'],
}).openapi('AuthResetPassword');

const onboardingSchema = z.object({
  company_name: z.string().min(1).optional(),
  tenant: z.string().min(1).optional(),
  name: z.string().min(1, 'Campo "Nome" é obrigatório.'),
  username: z.string().min(1, 'Campo "Nome de Usuário" é obrigatório.'),
  cnpj: z.string().max(20).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
}).refine((data) => data.company_name || data.tenant, {
  message: 'Campo "Nome da empresa" é obrigatório.',
  path: ['company_name'],
}).openapi('Onboarding');

const publicAuthConfigDataSchema = z.object({
  deployment_mode: z.string(),
  tenant_count: z.number(),
  registration_enabled: z.boolean(),
  onboarding_enabled: z.boolean(),
  local_instance_configured: z.boolean(),
  auth: z.object({
    access_token_ttl_seconds: z.number(),
    refresh_token_ttl_days: z.number(),
    google_enabled: z.boolean(),
  }),
}).openapi('PublicAuthConfigData');

const authSessionDataSchema = z.object({
  token: z.string(),
  expires_in: z.number().optional(),
  refresh_expires_in: z.number().optional(),
  token_type: z.string().optional(),
  user: sanitizedUserSchema.nullable().optional(),
}).openapi('AuthSessionData');

const authAuthorizeResponseSchema = buildApiResponseSchema(
  z.object({
    authorization_url: z.string().url(),
  }),
  'AuthAuthorizeResponse',
);

const authConfigResponseSchema = buildApiResponseSchema(publicAuthConfigDataSchema, 'AuthConfigResponse');
const authLoginResponseSchema = buildApiResponseSchema(authSessionDataSchema, 'AuthLoginResponse');
const authCallbackResponseSchema = buildApiResponseSchema(authSessionDataSchema, 'AuthCallbackResponse');
const authRefreshResponseSchema = buildApiResponseSchema(authSessionDataSchema, 'AuthRefreshResponse');
const authMeResponseSchema = buildApiResponseSchema(z.object({
  user: sanitizedUserSchema.nullable(),
  permissions: z.array(z.string()),
  access: z.any().optional(),
}), 'AuthMeResponse');
const authOnboardingResponseSchema = buildApiResponseSchema(sanitizedUserSchema.nullable(), 'AuthOnboardingResponse');
const authRegisterResponseSchema = buildApiResponseSchema(z.object({
  email: z.string().email(),
  setup_required: z.boolean(),
  setup_url: z.string().url().optional(),
}), 'AuthRegisterResponse');
const authGenericResponseSchema = buildApiResponseSchema(z.object({
  accepted: z.boolean(),
  reset_url: z.string().url().optional(),
}).partial(), 'AuthGenericResponse');

export {
  authAuthorizeResponseSchema,
  authLoginSchema,
  authCallbackResponseSchema,
  authRefreshSchema,
  authRegisterSchema,
  authRegisterResponseSchema,
  authSetupPasswordSchema,
  authVerifyEmailSchema,
  authForgotPasswordSchema,
  authResetPasswordSchema,
  authGenericResponseSchema,
  authAuthorizeSchema,
  authCallbackSchema,
  authConfigResponseSchema,
  authMeResponseSchema,
  authOnboardingResponseSchema,
  authSessionDataSchema,
  onboardingSchema,
  authLoginResponseSchema,
  authRefreshResponseSchema,
};
