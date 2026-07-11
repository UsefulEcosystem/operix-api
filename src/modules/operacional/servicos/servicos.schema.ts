import { buildApiListResponseSchema, buildApiResponseSchema } from '../../../core/schemas/api-response.schema.js';
import { z } from '../../../core/schemas/zod-openapi.js';

const serviceSchema = z.object({
  id: z.number().nullable().optional(),
  tenant_id: z.number().nullable().optional(),
  product: z.string().min(1),
  client: z.string().min(1),
  telephone: z.string().min(1),
  adress: z.string().optional(),
  status_id: z.union([z.string(), z.number()]).optional(),
  payment_status_id: z.number().optional(),
  order_of_service: z.number().nullable().optional(),
  observation: z.string().optional(),
  created_at: z.string().nullable().optional(),
  updated_at_service: z.string().nullable().optional(),
  updated_at_payment: z.string().nullable().optional(),
  created_at_warehouse: z.string().nullable().optional(),
}).openapi('Service');

const serviceCreateSchema = serviceSchema.pick({
  product: true,
  client: true,
  telephone: true,
  adress: true,
  observation: true,
  status_id: true,
}).extend({
  product: z.string().min(1, 'Campo "Produto" é obrigatório.'),
  client: z.string().min(1, 'Campo "Cliente" é obrigatório.'),
  telephone: z.string().min(1, 'Campo "Telefone" é obrigatório.'),
  adress: z.string().optional(),
  observation: z.string().optional(),
  status_id: z.union([z.string(), z.number()]).refine((val) => val !== '', { message: 'Campo "Situação" é obrigatório.' }),
}).openapi('ServiceCreate');

const serviceUpdateInfoClientSchema = serviceSchema.pick({
  product: true,
  client: true,
  telephone: true,
  adress: true,
  observation: true,
}).openapi('ServiceUpdateInfoClient');

const serviceResponseSchema = buildApiResponseSchema(serviceSchema, 'ServiceResponse');
const serviceListResponseSchema = buildApiListResponseSchema(serviceSchema, 'ServiceListResponse');

export {
  serviceSchema,
  serviceCreateSchema,
  serviceUpdateInfoClientSchema,
  serviceResponseSchema,
  serviceListResponseSchema,
};
