import { buildApiResponseSchema } from '../../core/schemas/api-response.schema.js';
import { z } from '../../core/schemas/zod-openapi.js';

const servicePartCreateSchema = z.object({
  stock_id: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
  unit_price: z.number().nonnegative().optional(),
  serial_number: z.string().max(120).optional().nullable(),
  used_at: z.string().datetime().optional(),
}).openapi('ServicePartCreate');

const servicePartSchema = z.object({
  id: z.number(),
  service_id: z.number(),
  stock_id: z.number(),
  item_name: z.string(),
  item_code: z.string(),
  serial_number: z.string().nullable(),
  quantity: z.number(),
  unit_price: z.union([z.number(), z.string()]),
  total_price: z.union([z.number(), z.string()]),
  used_at: z.string().or(z.date()),
}).openapi('ServicePart');

const servicePartResponseSchema = buildApiResponseSchema(servicePartSchema, 'ServicePartResponse');

export { servicePartCreateSchema, servicePartResponseSchema, servicePartSchema };
