import { z } from '../../core/schemas/zod-openapi.js';
import { buildApiListResponseSchema, buildApiResponseSchema } from '../../core/schemas/api-response.schema.js';
const fornecedorSchema = z.object({ id: z.number(), name: z.string(), cnpj: z.string().nullable(), phone: z.string().nullable(), address: z.string().nullable(), tenant_id: z.number() }).openapi('Fornecedor');
const fornecedorWriteSchema = z.object({ name: z.string().trim().min(1, 'Campo "Nome" é obrigatório.').max(180), cnpj: z.string().max(18).optional().nullable(), phone: z.string().max(40).optional().nullable(), address: z.string().max(255).optional().nullable() });
const fornecedorCreateSchema = fornecedorWriteSchema.openapi('FornecedorCreate');
const fornecedorUpdateSchema = fornecedorWriteSchema.openapi('FornecedorUpdate');
const fornecedorListResponseSchema = buildApiListResponseSchema(fornecedorSchema, 'FornecedorListResponse');
const fornecedorResponseSchema = buildApiResponseSchema(fornecedorSchema, 'FornecedorResponse');
export { fornecedorCreateSchema, fornecedorUpdateSchema, fornecedorListResponseSchema, fornecedorResponseSchema, fornecedorSchema };
