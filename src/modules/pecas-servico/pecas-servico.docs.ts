import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { servicePartCreateSchema, servicePartResponseSchema } from './pecas-servico.schema.js';

export function registerPecasServicoDocs(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'post',
    path: '/servicos/{serviceId}/pecas',
    tags: ['Peças de Serviço'],
    security: [{ bearerAuth: [] }],
    request: { body: { required: true, content: { 'application/json': { schema: servicePartCreateSchema } } } },
    responses: { 201: { description: 'Peça registrada', content: { 'application/json': { schema: servicePartResponseSchema } } } },
  });
}
