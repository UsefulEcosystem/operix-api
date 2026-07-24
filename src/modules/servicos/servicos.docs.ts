import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { serviceCreateSchema, serviceListResponseSchema } from './servicos.schema.js';

export function registerServicosDocs(registry: OpenAPIRegistry) {
  const security = [{ bearerAuth: [] }];
  registry.registerPath({ method: 'get', path: '/servicos', tags: ['Serviços'], security, responses: { 200: { description: 'Serviços listados', content: { 'application/json': { schema: serviceListResponseSchema } } } } });
  registry.registerPath({ method: 'post', path: '/servicos', tags: ['Serviços'], security, request: { body: { required: true, content: { 'application/json': { schema: serviceCreateSchema } } } }, responses: { 201: { description: 'Serviço criado' } } });
  registry.registerPath({ method: 'put', path: '/servicos/info/cliente/{id}', tags: ['Serviços'], security, responses: { 200: { description: 'Dados atualizados' } } });
  registry.registerPath({ method: 'put', path: '/servicos/status/{id}', tags: ['Serviços'], security, responses: { 200: { description: 'Status atualizado' } } });
  registry.registerPath({ method: 'put', path: '/servicos/status/pagamento/{id}', tags: ['Serviços'], security, responses: { 200: { description: 'Status de pagamento atualizado' } } });
  registry.registerPath({ method: 'delete', path: '/servicos/{id}/{cod}', tags: ['Serviços'], security, responses: { 204: { description: 'Serviço removido' } } });
}
