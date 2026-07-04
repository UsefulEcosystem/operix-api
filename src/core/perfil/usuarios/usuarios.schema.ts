import { buildApiListResponseSchema, buildApiResponseSchema } from '../../schemas/api-response.schema.js';
import { z } from '../../schemas/zod-openapi.js';
import { manageableModuleKeys } from '../permissoes/permissoes.catalog.js';

const userSchema = z.object({
  id: z.number().nullable().optional(),
  username: z.string().min(1),
  email: z.string().email(),
  tenant: z.string().nullable().optional(),
  tenant_id: z.number().nullable().optional(),
  password: z.string().nullable().optional(),
  admin: z.boolean().nullable().optional(),
  root: z.boolean().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  role_title: z.string().nullable().optional(),
  active: z.boolean().nullable().optional(),
  preferences: z.record(z.string(), z.any()).nullable().optional(),
  name: z.string().min(1),
}).openapi('User');

const userPublicSchema = userSchema.omit({
  password: true,
}).openapi('UserPublic');

const sanitizedUserSchema = userPublicSchema.extend({
  sub: z.string().nullable().optional(),
  onboarding_required: z.boolean().optional(),
  roles: z.array(z.string()).optional(),
  createdAt: z.union([z.string(), z.date()]).nullable().optional(),
  updatedAt: z.union([z.string(), z.date()]).nullable().optional(),
}).openapi('SanitizedUser');

const userCreateSchema = z.object({
  name: z.string().min(1, 'Campo "Nome" é obrigatório.'),
  username: z.string().min(1, 'Campo "Nome de Usuário" é obrigatório.'),
  email: z.string().email('Campo "Email" inválido.'),
  password: z.string().min(8, 'Campo "Senha" deve ter no mínimo 8 caracteres.'),
  admin: z.boolean().optional().default(false),
  role_title: z.string().optional().nullable(),
  modules: z.array(z.enum(manageableModuleKeys)).optional().default([]),
}).openapi('UserCreate');

const userAccessUpdateSchema = z.object({
  admin: z.boolean().optional(),
  root: z.boolean().optional(),
  active: z.boolean().optional(),
  role_title: z.string().optional().nullable(),
}).openapi('UserAccessUpdate');

const userListResponseSchema = buildApiListResponseSchema(userPublicSchema, 'UserListResponse');
const userResponseSchema = buildApiResponseSchema(userPublicSchema, 'UserResponse');

export {
  sanitizedUserSchema,
  userAccessUpdateSchema,
  userCreateSchema,
  userPublicSchema,
  userResponseSchema,
  userSchema,
  userListResponseSchema,
};
