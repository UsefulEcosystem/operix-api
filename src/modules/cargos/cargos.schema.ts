import { z } from '../../core/schemas/zod-openapi.js';
import { buildApiListResponseSchema, buildApiResponseSchema } from '../../core/schemas/api-response.schema.js';

const cargoSchema = z.object({
  id: z.number(), name: z.string(), description: z.string().nullable(), is_system: z.boolean(), tenant_id: z.number().nullable(),
}).openapi('Cargo');
const cargoWriteSchema = z.object({
  name: z.string().trim().min(1, 'Campo "Nome" é obrigatório.').max(120),
  description: z.string().max(255).optional().nullable(),
});
const cargoCreateSchema = cargoWriteSchema.openapi('CargoCreate');
const cargoUpdateSchema = cargoWriteSchema.openapi('CargoUpdate');
const cargoListResponseSchema = buildApiListResponseSchema(cargoSchema, 'CargoListResponse');
const cargoResponseSchema = buildApiResponseSchema(cargoSchema, 'CargoResponse');
export { cargoCreateSchema, cargoListResponseSchema, cargoResponseSchema, cargoSchema, cargoUpdateSchema };
