import { buildApiListResponseSchema, buildApiResponseSchema } from '../../core/schemas/api-response.schema.js';
import { z } from '../../core/schemas/zod-openapi.js';
import { manageableModuleKeys } from '../../core/permissoes/permissoes.catalog.js';

const userSchema = z.object({
  id: z.number().nullable().optional(),
  username: z.string().min(1),
  email: z.string().email().nullable().optional(),
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
  username: z.string()
    .trim()
    .min(3, 'Campo "Nome de Usuário" deve ter no mínimo 3 caracteres.')
    .max(50, 'Campo "Nome de Usuário" deve ter no máximo 50 caracteres.')
    .regex(/^[A-Za-z0-9._-]+$/, 'Campo "Nome de Usuário" contém caracteres inválidos.'),
  email: z.string().email('Campo "Email" inválido.').optional().nullable(),
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
