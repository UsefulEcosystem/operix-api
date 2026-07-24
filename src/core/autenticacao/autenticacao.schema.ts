import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { buildApiResponseSchema } from '../schemas/api-response.schema.js';
import { sanitizedUserSchema } from '../../modules/usuarios/usuarios.schema.js';

extendZodWithOpenApi(z);

const authLoginSchema = z.object({
  email: z.string().email('Campo "E-mail" inválido.'),
  password: z.string().min(1, 'Campo "Senha" é obrigatório.'),
  remember: z.boolean().optional(),
}).openapi('AuthLogin');

const authInternalLoginSchema = z.object({
  company_code: z.string()
    .trim()
    .regex(/^OPE-[A-Z2-9]{4}-[A-Z2-9]{4}$/i, 'Código da empresa inválido.'),
  username: z.string().trim().min(1, 'Campo "Usuário" é obrigatório.'),
  password: z.string().min(1, 'Campo "Senha" é obrigatório.'),
}).openapi('AuthInternalLogin');

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

const authCheckEmailSchema = z.object({
  email: z.string().email('Campo "E-mail" inválido.'),
}).openapi('AuthCheckEmail');

const authRegisterSchema = z.object({
  email: z.string().email('Campo "E-mail" inválido.'),
  password: z.string().min(8, 'Campo "Senha" deve ter no mínimo 8 caracteres.'),
  confirm_password: z.string().min(8, 'Campo "Confirmar senha" deve ter no mínimo 8 caracteres.'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'As senhas informadas não conferem.',
  path: ['confirm_password'],
}).openapi('AuthRegister');

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
  name: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  cnpj: z.string().max(20).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
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

const authCheckEmailResponseSchema = buildApiResponseSchema(
  z.object({
    exists: z.boolean(),
    active: z.boolean(),
  }),
  'AuthCheckEmailResponse',
);

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
const authRegisterResponseSchema = buildApiResponseSchema(authSessionDataSchema, 'AuthRegisterResponse');
const authGenericResponseSchema = buildApiResponseSchema(z.object({
  accepted: z.boolean(),
  reset_url: z.string().url().optional(),
}).partial(), 'AuthGenericResponse');

export {
  authAuthorizeResponseSchema,
  authInternalLoginSchema,
  authLoginSchema,
  authCallbackResponseSchema,
  authRefreshSchema,
  authCheckEmailSchema,
  authCheckEmailResponseSchema,
  authRegisterSchema,
  authRegisterResponseSchema,
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
