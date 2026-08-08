import { buildApiListResponseSchema, buildApiResponseSchema } from '../../core/schemas/api-response.schema.js';
import { z } from '../../core/schemas/zod-openapi.js';

const clientSchema = z.object({
  id: z.number(),
  full_name: z.string(),
  document: z.string().nullable(),
  phone: z.string(),
  address: z.string().nullable(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
}).openapi('Client');

const clientWriteSchema = z.object({
  full_name: z.string().min(1, 'Campo "Nome completo" é obrigatório.').max(180),
  document: z.string().max(40).optional().nullable(),
  phone: z.string().min(1, 'Campo "Telefone" é obrigatório.').max(40),
  address: z.string().max(255).optional().nullable(),
});

const clientCreateSchema = clientWriteSchema.openapi('ClientCreate');
const clientUpdateSchema = clientWriteSchema.openapi('ClientUpdate');
const clientResponseSchema = buildApiResponseSchema(clientSchema, 'ClientResponse');
const clientListResponseSchema = buildApiListResponseSchema(clientSchema, 'ClientListResponse');

export { clientSchema, clientCreateSchema, clientUpdateSchema, clientResponseSchema, clientListResponseSchema };
