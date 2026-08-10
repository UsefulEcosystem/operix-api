import { buildApiListResponseSchema, buildApiResponseSchema } from '../../core/schemas/api-response.schema.js';
import { z } from '../../core/schemas/zod-openapi.js';

const stockSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().nullable().optional(),
  supplier_name: z.string().max(180).nullable().optional(),
  supplier_id: z.number().int().positive().nullable().optional(),
  quantity: z.number().int(),
  purchasePrice: z.union([z.number(), z.string()]),
  salePrice: z.union([z.number(), z.string()]),
  warranty_days: z.number().int().nonnegative().default(0),
}).openapi('Stock');

const stockWriteSchema = z.object({
  name: z.string().min(1, 'Campo "Nome" é obrigatório.'),
  code: z.string().min(1, 'Campo "Código" é obrigatório.'),
  description: z.string().max(255).optional().nullable(),
  supplier_name: z.string().max(180).optional().nullable(),
  supplier_id: z.number().int().positive().optional().nullable(),
  quantity: z.number().int().nonnegative(),
  purchasePrice: z.number().nonnegative(),
  salePrice: z.number().nonnegative(),
  warranty_days: z.number().int().nonnegative().default(0),
});

const stockCreateSchema = stockWriteSchema.openapi('StockCreate');
const stockUpdateSchema = stockWriteSchema.openapi('StockUpdate');

const stockResponseSchema = buildApiResponseSchema(stockSchema, 'StockResponse');
const stockListResponseSchema = buildApiListResponseSchema(stockSchema, 'StockListResponse');

export { stockSchema, stockCreateSchema, stockUpdateSchema, stockResponseSchema, stockListResponseSchema };
