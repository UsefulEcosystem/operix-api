import { buildApiListResponseSchema, buildApiResponseSchema } from '../../../core/schemas/api-response.schema.ts';
import { z } from '../../../core/schemas/zod-openapi.ts';

const typeProductSchema = z.object({
  id: z.number().nullable().optional(),
  tenant_id: z.number().nullable().optional(),
  name: z.string().min(1),
}).openapi('TypeProduct');

const typeProductCreateSchema = typeProductSchema.omit({
  id: true,
  tenant_id: true,
}).extend({
  name: z.string().min(1, 'Campo "Nome" é obrigatório.'),
}).openapi('TypeProductCreate');

const typeProductResponseSchema = buildApiResponseSchema(typeProductSchema, 'TypeProductResponse');
const typeProductListResponseSchema = buildApiListResponseSchema(typeProductSchema, 'TypeProductListResponse');

export {
  typeProductSchema,
  typeProductCreateSchema,
  typeProductResponseSchema,
  typeProductListResponseSchema,
};
