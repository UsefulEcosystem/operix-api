import { buildApiListResponseSchema, buildApiResponseSchema } from '../../core/schemas/api-response.schema.js';
import { z } from '../../core/schemas/zod-openapi.js';

const saleItemCreateSchema = z.object({
  stock_id: z.number().int().positive(),
  quantity: z.number().int().positive(),
  unit_price: z.number().nonnegative().optional(),
  serial_number: z.string().max(120).optional().nullable(),
  warranty_days: z.number().int().nonnegative().optional(),
}).openapi('SaleItemCreate');

const saleCreateSchema = z.object({
  attendant_user_id: z.number().int().positive('Atendente é obrigatório.'),
  client_id: z.number().int().positive().nullable().optional(),
  customer_name: z.string().min(1, 'Campo "Cliente" é obrigatório.'),
  customer_document: z.string().max(40).optional().nullable(),
  customer_phone: z.string().max(40).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  sold_at: z.string().datetime().optional(),
  items: z.array(saleItemCreateSchema).min(1, 'Informe ao menos um item.'),
}).openapi('SaleCreate');

const saleItemSchema = z.object({
  id: z.number(),
  stock_id: z.number(),
  item_name: z.string(),
  item_code: z.string(),
  serial_number: z.string().nullable(),
  quantity: z.number(),
  unit_price: z.union([z.number(), z.string()]),
  total_price: z.union([z.number(), z.string()]),
  warranty_days: z.number().int().nonnegative(),
}).openapi('SaleItem');

const saleSchema = z.object({
  id: z.number(),
  client_id: z.number().nullable().optional(),
  customer_name: z.string(),
  customer_document: z.string().nullable(),
  customer_phone: z.string().nullable(),
  total_amount: z.union([z.number(), z.string()]),
  notes: z.string().nullable(),
  sold_at: z.string().or(z.date()),
  attendant_user_id: z.number().nullable().optional(),
  attendant_user_name: z.string().nullable().optional(),
  items: z.array(saleItemSchema),
}).openapi('Sale');

const saleResponseSchema = buildApiResponseSchema(saleSchema, 'SaleResponse');
const saleListResponseSchema = buildApiListResponseSchema(saleSchema, 'SaleListResponse');

export { saleCreateSchema, saleItemCreateSchema, saleListResponseSchema, saleResponseSchema, saleSchema };
