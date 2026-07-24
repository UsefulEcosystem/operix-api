import { buildApiResponseSchema } from '../schemas/api-response.schema.js';
import { z } from '../schemas/zod-openapi.js';
import { userPublicSchema } from '../../modules/usuarios/usuarios.schema.js';
import { manageableModuleKeys } from './permissoes.catalog.js';

const manageableModuleKeySchema = z.enum(manageableModuleKeys);
const permissionEffectSchema = z.enum(['allow', 'deny']);
const permissionSourceSchema = z.enum(['authenticated', 'role', 'override:allow', 'override:deny', 'deployment:local', 'plan', 'none']);

const permissionCatalogItemSchema = z.object({
  key: z.string(),
  module_key: z.string(),
  module_label: z.string(),
  module_description: z.string(),
  role_key: z.string().nullable(),
  label: z.string(),
  description: z.string(),
  route: z.string().nullable(),
}).openapi('CatalogoPermissaoItem');

const permissionModuleSchema = z.object({
  key: z.string(),
  label: z.string(),
  description: z.string(),
  role_key: z.string().nullable(),
  permissions: z.array(permissionCatalogItemSchema),
}).openapi('PermissaoModule');

const permissionDecisionSchema = permissionCatalogItemSchema.extend({
  allowed: z.boolean(),
  source: permissionSourceSchema,
}).openapi('PermissaoDecision');

const permissionOverrideSchema = z.object({
  permission_key: z.string(),
  effect: permissionEffectSchema,
}).openapi('SubstituicaoPermissao');

const permissionOverridesUpdateSchema = z.object({
  overrides: z.array(permissionOverrideSchema).superRefine((overrides, ctx) => {
    const uniqueKeys = new Set<string>();

    overrides.forEach((override, index) => {
      if (uniqueKeys.has(override.permission_key)) {
        ctx.addIssue({
          code: 'custom',
          message: 'permission_key duplicado.',
          path: [index, 'permission_key'],
        });
        return;
      }

      uniqueKeys.add(override.permission_key);
    });
  }),
}).openapi('SubstituicaoPermissaosUpdate');

const permissionsCatalogDataSchema = z.object({
  modules: z.array(permissionModuleSchema),
  permissions: z.array(permissionCatalogItemSchema),
  plans: z.array(z.any()),
}).openapi('PermissaosCatalogData');

const permissionsMeDataSchema = z.object({
  roles: z.array(z.string()),
  effective_permissions: z.array(z.string()),
  permissions: z.array(permissionDecisionSchema),
  access: z.any().optional(),
}).openapi('PermissaosMeData');

const permissionsUserDataSchema = z.object({
  user: userPublicSchema,
  roles: z.array(z.string()),
  module_roles: z.array(z.string()),
  overrides: z.array(permissionOverrideSchema),
  effective_permissions: z.array(z.string()),
  permissions: z.array(permissionDecisionSchema),
  access: z.any().optional(),
}).openapi('PermissaosUserData');

const permissionsCatalogResponseSchema = buildApiResponseSchema(
  permissionsCatalogDataSchema,
  'PermissaosCatalogResponse',
);

const permissionsMeResponseSchema = buildApiResponseSchema(
  permissionsMeDataSchema,
  'PermissaosMeResponse',
);

const permissionsUserResponseSchema = buildApiResponseSchema(
  permissionsUserDataSchema,
  'PermissaosUserResponse',
);

export {
  manageableModuleKeySchema,
  permissionCatalogItemSchema,
  permissionsCatalogDataSchema,
  permissionDecisionSchema,
  permissionEffectSchema,
  permissionModuleSchema,
  permissionsMeDataSchema,
  permissionOverrideSchema,
  permissionOverridesUpdateSchema,
  permissionsCatalogResponseSchema,
  permissionsMeResponseSchema,
  permissionsUserDataSchema,
  permissionsUserResponseSchema,
};
