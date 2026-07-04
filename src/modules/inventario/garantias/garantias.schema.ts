import { z } from '../../../core/schemas/zod-openapi.js';
import { buildApiListResponseSchema, buildApiResponseSchema } from '../../../core/schemas/api-response.schema.js';

const servicePartWarrantyCreateSchema = z.object({
  stock_id: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
  unit_price: z.number().nonnegative().optional(),
  warranty_months: z.number().int().nonnegative().optional().default(0),
  serial_number: z.string().max(120).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  used_at: z.string().datetime().optional(),
}).openapi('ServicePartWarrantyCreate');

const warrantySchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  source_type: z.enum(['sale', 'service']),
  sale_id: z.number().nullable().optional(),
  sale_item_id: z.number().nullable().optional(),
  service_id: z.number().nullable().optional(),
  service_part_id: z.number().nullable().optional(),
  stock_id: z.number(),
  customer_name: z.string(),
  customer_document: z.string().nullable().optional(),
  customer_phone: z.string().nullable().optional(),
  item_name: z.string(),
  item_code: z.string(),
  serial_number: z.string().nullable().optional(),
  quantity: z.number(),
  warranty_start_at: z.string().or(z.date()),
  warranty_end_at: z.string().or(z.date()),
  status: z.string(),
  notes: z.string().nullable().optional(),
}).openapi('Warranty');

const warrantyResponseSchema = buildApiResponseSchema(warrantySchema, 'WarrantyResponse');
const warrantyListResponseSchema = buildApiListResponseSchema(warrantySchema, 'WarrantyListResponse');

export {
  servicePartWarrantyCreateSchema,
  warrantyListResponseSchema,
  warrantyResponseSchema,
  warrantySchema,
};
