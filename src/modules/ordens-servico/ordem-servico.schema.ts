import { buildApiListResponseSchema, buildApiResponseSchema } from '../../core/schemas/api-response.schema.js';
import { z } from '../../core/schemas/zod-openapi.js';

const orderOfServiceSchema = z.object({
  cod_order: z.union([z.string(), z.number()]),
  estimate: z.string().nullable().optional(),
  value: z.union([z.string(), z.number()]).nullable().optional(),
  warranty_days: z.number().int().nonnegative().default(0),
  created_at: z.string().nullable(),
}).openapi('OrdemServico');

const orderUpdateEstimateSchema = z.object({
  type: z.string().min(1),
  description: z.string().min(1),
  price: z.union([z.string(), z.number()]).refine((val) => val !== ''),
  amount: z.union([z.string(), z.number()]).optional(),
}).superRefine((data, ctx) => {
  if (data.type !== 'simples' && (data.amount === undefined || data.amount === '')) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Campo "Quantidade" é obrigatório.', path: ['amount'] });
  }
}).openapi('OrderUpdateEstimate');

const orderWarrantyUpdateSchema = z.object({
  warranty_days: z.number().int().nonnegative(),
}).openapi('OrderWarrantyUpdate');

const orderOfServiceResponseSchema = buildApiResponseSchema(orderOfServiceSchema, 'OrdemServicoResponse');
const orderOfServiceListResponseSchema = buildApiListResponseSchema(orderOfServiceSchema, 'OrdemServicoListResponse');

export {
  orderOfServiceSchema,
  orderUpdateEstimateSchema,
  orderWarrantyUpdateSchema,
  orderOfServiceResponseSchema,
  orderOfServiceListResponseSchema,
};
