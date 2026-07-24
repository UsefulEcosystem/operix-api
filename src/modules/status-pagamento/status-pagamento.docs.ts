import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { statusPaymentCreateSchema, statusPaymentListResponseSchema } from './status-pagamento.schema.js';

export function registerStatusPagamentoDocs(registry: OpenAPIRegistry) {
  const security = [{ bearerAuth: [] }];
  registry.registerPath({ method: 'get', path: '/status-pagamento', tags: ['Status de Pagamento'], security, responses: { 200: { description: 'Status listados', content: { 'application/json': { schema: statusPaymentListResponseSchema } } } } });
  registry.registerPath({ method: 'post', path: '/status-pagamento', tags: ['Status de Pagamento'], security, request: { body: { required: true, content: { 'application/json': { schema: statusPaymentCreateSchema } } } }, responses: { 201: { description: 'Status criado' } } });
  registry.registerPath({ method: 'delete', path: '/status-pagamento/{id}', tags: ['Status de Pagamento'], security, responses: { 204: { description: 'Status removido' } } });
}
