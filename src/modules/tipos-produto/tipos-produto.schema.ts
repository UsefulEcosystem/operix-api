import { buildApiListResponseSchema, buildApiResponseSchema } from '../../core/schemas/api-response.schema.ts';
import { z } from '../../core/schemas/zod-openapi.ts';

const typeProductSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
}).openapi('TypeProduct');

const typeProductCreateSchema = z.object({
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
