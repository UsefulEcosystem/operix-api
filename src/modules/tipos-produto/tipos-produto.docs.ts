import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { typeProductCreateSchema, typeProductListResponseSchema } from './tipos-produto.schema.js';

export function registerTiposProdutoDocs(registry: OpenAPIRegistry) {
  const security = [{ bearerAuth: [] }];
  registry.registerPath({ method: 'get', path: '/tipos-produto', tags: ['Tipos de Produto'], security, responses: { 200: { description: 'Tipos listados', content: { 'application/json': { schema: typeProductListResponseSchema } } } } });
  registry.registerPath({ method: 'post', path: '/tipos-produto', tags: ['Tipos de Produto'], security, request: { body: { required: true, content: { 'application/json': { schema: typeProductCreateSchema } } } }, responses: { 201: { description: 'Tipo criado' } } });
  registry.registerPath({ method: 'delete', path: '/tipos-produto/{id}', tags: ['Tipos de Produto'], security, responses: { 204: { description: 'Tipo removido' } } });
}
