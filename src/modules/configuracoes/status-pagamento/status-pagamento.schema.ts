import {
  buildApiListResponseSchema,
  buildApiResponseSchema,
} from "../../../core/schemas/api-response.schema.js";
import { z } from "../../../core/schemas/zod-openapi.js";

const statusPaymentSchema = z
  .object({
    id: z.number().nullable().optional(),
    tenant_id: z.number().nullable(),
    description: z.string().min(1),
    color: z.string(),
    default: z.boolean()
  })
  .openapi("StatusPagamento");

const statusPaymentCreateSchema = statusPaymentSchema
  .omit({
    id: true,
    tenant_id: true,
  })
  .extend({
    description: z.string().min(1, 'Campo "Descrição" é obrigatório.'),
  })
  .openapi("StatusPagamentoCreate");

const statusPaymentResponseSchema = buildApiResponseSchema(
  statusPaymentSchema,
  "StatusPagamentoResponse",
);
const statusPaymentListResponseSchema = buildApiListResponseSchema(
  statusPaymentSchema,
  "StatusPagamentoListResponse",
);

export {
  statusPaymentSchema,
  statusPaymentCreateSchema,
  statusPaymentResponseSchema,
  statusPaymentListResponseSchema,
};
