import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { saleCreateSchema, saleListResponseSchema, saleResponseSchema } from './vendas.schema.js';

export function registerVendasDocs(registry: OpenAPIRegistry) {
  const security = [{ bearerAuth: [] }];
  registry.registerPath({ method: 'get', path: '/vendas', tags: ['Vendas'], security, responses: { 200: { description: 'Vendas listadas', content: { 'application/json': { schema: saleListResponseSchema } } } } });
  registry.registerPath({ method: 'get', path: '/vendas/{id}', tags: ['Vendas'], security, responses: { 200: { description: 'Venda detalhada', content: { 'application/json': { schema: saleResponseSchema } } } } });
  registry.registerPath({ method: 'post', path: '/vendas', tags: ['Vendas'], security, request: { body: { required: true, content: { 'application/json': { schema: saleCreateSchema } } } }, responses: { 201: { description: 'Venda registrada' } } });
}
