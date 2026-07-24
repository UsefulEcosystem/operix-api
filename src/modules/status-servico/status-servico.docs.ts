import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { statusServiceCreateSchema, statusServiceListResponseSchema } from './status-servico.schema.js';

export function registerStatusServicoDocs(registry: OpenAPIRegistry) {
  const security = [{ bearerAuth: [] }];
  registry.registerPath({ method: 'get', path: '/status-servico', tags: ['Status de Serviço'], security, responses: { 200: { description: 'Status listados', content: { 'application/json': { schema: statusServiceListResponseSchema } } } } });
  registry.registerPath({ method: 'post', path: '/status-servico', tags: ['Status de Serviço'], security, request: { body: { required: true, content: { 'application/json': { schema: statusServiceCreateSchema } } } }, responses: { 201: { description: 'Status criado' } } });
  registry.registerPath({ method: 'delete', path: '/status-servico/{id}', tags: ['Status de Serviço'], security, responses: { 204: { description: 'Status removido' } } });
}
