import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { stockCreateSchema, stockListResponseSchema, stockUpdateSchema } from './estoque.schema.js';

export function registerEstoqueDocs(registry: OpenAPIRegistry) {
  const security = [{ bearerAuth: [] }];
  registry.registerPath({ method: 'get', path: '/estoque', tags: ['Estoque'], security, responses: { 200: { description: 'Itens listados', content: { 'application/json': { schema: stockListResponseSchema } } } } });
  registry.registerPath({ method: 'post', path: '/estoque', tags: ['Estoque'], security, request: { body: { required: true, content: { 'application/json': { schema: stockCreateSchema } } } }, responses: { 201: { description: 'Item criado' } } });
  registry.registerPath({ method: 'put', path: '/estoque/{id}', tags: ['Estoque'], security, request: { body: { required: true, content: { 'application/json': { schema: stockUpdateSchema } } } }, responses: { 200: { description: 'Item atualizado' } } });
  registry.registerPath({ method: 'delete', path: '/estoque/{id}', tags: ['Estoque'], security, responses: { 200: { description: 'Item removido' } } });
}
