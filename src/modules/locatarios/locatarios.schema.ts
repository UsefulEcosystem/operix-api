import { buildApiListResponseSchema, buildApiResponseSchema } from '../../core/schemas/api-response.schema.js';
import { z } from '../../core/schemas/zod-openapi.js';

const tenantSchema = z.object({
  id: z.number().nullable().optional(),
  name: z.string().min(1),
  access_code: z.string().nullable().optional(),
  cnpj: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  logo_url: z.string().nullable().optional(),
  plan_key: z.string().nullable().optional(),
  subscription_status: z.string().nullable().optional(),
  trial_started_at: z.union([z.string(), z.date()]).nullable().optional(),
  trial_ends_at: z.union([z.string(), z.date()]).nullable().optional(),
  enabled_modules: z.array(z.string()).nullable().optional(),
}).openapi('Tenant');

const tenantCreateSchema = tenantSchema.omit({
  id: true,
  access_code: true,
}).extend({
  name: z.string().min(1, 'Campo "Nome" é obrigatório.'),
  cnpj: z.string().max(20).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  logo_url: z.string().optional().nullable(),
  enabled_modules: z.array(z.string()).optional().nullable(),
}).openapi('TenantCreate');

const tenantResponseSchema = buildApiResponseSchema(tenantSchema, 'TenantResponse');
const tenantListResponseSchema = buildApiListResponseSchema(tenantSchema, 'TenantListResponse');

export { tenantSchema, tenantCreateSchema, tenantResponseSchema, tenantListResponseSchema };
