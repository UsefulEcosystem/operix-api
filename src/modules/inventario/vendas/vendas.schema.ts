import { z } from '../../../core/schemas/zod-openapi.js';
import { buildApiListResponseSchema, buildApiResponseSchema } from '../../../core/schemas/api-response.schema.js';

const saleItemCreateSchema = z.object({
  stock_id: z.number().int().positive(),
  quantity: z.number().int().positive(),
  unit_price: z.number().nonnegative().optional(),
  warranty_months: z.number().int().nonnegative().optional().default(0),
  serial_number: z.string().max(120).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
}).openapi('SaleItemCreate');

const saleCreateSchema = z.object({
  customer_name: z.string().min(1, 'Campo "Cliente" é obrigatório.'),
  customer_document: z.string().max(40).optional().nullable(),
  customer_phone: z.string().max(40).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  sold_at: z.string().datetime().optional(),
  items: z.array(saleItemCreateSchema).min(1, 'Informe ao menos um item.'),
}).openapi('SaleCreate');

const saleSchema = z.object({
  id: z.number(),
  tenant_id: z.number(),
  customer_name: z.string(),
  customer_document: z.string().nullable().optional(),
  customer_phone: z.string().nullable().optional(),
  total_amount: z.union([z.number(), z.string()]),
  status: z.string(),
  notes: z.string().nullable().optional(),
  sold_at: z.string().or(z.date()).optional(),
  items: z.array(z.any()).optional(),
  warranties: z.array(z.any()).optional(),
}).openapi('Sale');

const saleResponseSchema = buildApiResponseSchema(saleSchema, 'SaleResponse');
const saleListResponseSchema = buildApiListResponseSchema(saleSchema, 'SaleListResponse');

export { saleCreateSchema, saleItemCreateSchema, saleListResponseSchema, saleResponseSchema, saleSchema };
