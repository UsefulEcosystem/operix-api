import { buildApiListResponseSchema, buildApiResponseSchema } from '../../core/schemas/api-response.schema.js';
import { z } from '../../core/schemas/zod-openapi.js';

const serviceSchema = z.object({
  id: z.number(),
  client_id: z.number().nullable().optional(),
  product: z.string(),
  client: z.string(),
  telephone: z.string(),
  adress: z.string().nullable().optional(),
  status_id: z.number().nullable(),
  payment_status_id: z.number().nullable(),
  order_of_service: z.number().nullable(),
  observation: z.string().nullable().optional(),
  created_at: z.string().nullable(),
  updated_at_service: z.string().nullable(),
  updated_at_payment: z.string().nullable(),
}).openapi('Service');

const serviceClientFieldsSchema = z.object({
  client_id: z.coerce.number().int().positive().nullable().optional(),
  product: z.string().min(1, 'Campo "Produto" é obrigatório.'),
  client: z.string().optional(),
  telephone: z.string().optional(),
  adress: z.string().optional(),
  observation: z.string().optional(),
});

const serviceCreateSchema = serviceClientFieldsSchema.extend({
  status_id: z.coerce.number().int().positive('Campo "Situação" é obrigatório.'),
}).openapi('ServiceCreate');

const serviceUpdateInfoClientSchema = serviceClientFieldsSchema.openapi('ServiceUpdateInfoClient');
const serviceStatusUpdateSchema = z.object({
  status_id: z.coerce.number().int().positive(),
}).openapi('ServiceStatusUpdate');
const servicePaymentStatusUpdateSchema = z.object({
  payment_status_id: z.coerce.number().int().positive(),
}).openapi('ServicePaymentStatusUpdate');

const serviceResponseSchema = buildApiResponseSchema(serviceSchema, 'ServiceResponse');
const serviceListResponseSchema = buildApiListResponseSchema(serviceSchema, 'ServiceListResponse');

export {
  serviceSchema,
  serviceCreateSchema,
  serviceUpdateInfoClientSchema,
  serviceStatusUpdateSchema,
  servicePaymentStatusUpdateSchema,
  serviceResponseSchema,
  serviceListResponseSchema,
};
