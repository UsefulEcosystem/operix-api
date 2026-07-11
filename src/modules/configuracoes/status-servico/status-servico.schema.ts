import { buildApiListResponseSchema, buildApiResponseSchema } from '../../../core/schemas/api-response.schema.ts';
import { z } from '../../../core/schemas/zod-openapi.ts';

const statusServiceSchema = z.object({
  id: z.number().nullable().optional(),
  tenant_id: z.number().nullable().optional(),
  description: z.string().min(1),
  color: z.string().optional(),
}).openapi('StatusServico');

const statusServiceCreateSchema = statusServiceSchema.omit({
  id: true,
  tenant_id: true,
}).extend({
  description: z.string().min(1, 'Campo "Descrição" é obrigatório.'),
}).openapi('StatusServicoCreate');

const statusServiceResponseSchema = buildApiResponseSchema(statusServiceSchema, 'StatusServicoResponse');
const statusServiceListResponseSchema = buildApiListResponseSchema(statusServiceSchema, 'StatusServicoListResponse');

export {
  statusServiceSchema,
  statusServiceCreateSchema,
  statusServiceResponseSchema,
  statusServiceListResponseSchema,
};
