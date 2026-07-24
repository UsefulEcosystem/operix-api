import { buildApiListResponseSchema, buildApiResponseSchema } from '../../core/schemas/api-response.schema.ts';
import { z } from '../../core/schemas/zod-openapi.ts';

const statusServiceSchema = z.object({
  id: z.number(),
  description: z.string().min(1),
  color: z.string().nullable().optional(),
}).openapi('StatusServico');

const statusServiceCreateSchema = z.object({
  description: z.string().min(1, 'Campo "Descrição" é obrigatório.'),
  color: z.string().optional(),
}).openapi('StatusServicoCreate');

const statusServiceResponseSchema = buildApiResponseSchema(statusServiceSchema, 'StatusServicoResponse');
const statusServiceListResponseSchema = buildApiListResponseSchema(statusServiceSchema, 'StatusServicoListResponse');

export {
  statusServiceSchema,
  statusServiceCreateSchema,
  statusServiceResponseSchema,
  statusServiceListResponseSchema,
};
