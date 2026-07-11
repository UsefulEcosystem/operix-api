import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { orderOfServiceListResponseSchema, orderOfServiceSchema } from '../ordem-servico/ordem-servico.schema.js';
import { serviceCreateSchema, serviceListResponseSchema, serviceSchema } from '../servicos/servicos.schema.js';

export function registerOperacionalDocs(registry: OpenAPIRegistry) {
  // Register Models
  registry.register('Service', serviceSchema);
  registry.register('OrdemServico', orderOfServiceSchema);

  const security = [{ bearerAuth: [] }];

  // Services
  registry.registerPath({ method: 'get', path: '/servicos', tags: ['Serviços'], security, responses: { 200: { content: { 'application/json': { schema: serviceListResponseSchema } }, description: 'Serviços listados' } } });
  registry.registerPath({ method: 'post', path: '/servicos', tags: ['Serviços'], security, request: { body: { content: { 'application/json': { schema: serviceCreateSchema } }, required: true } }, responses: { 201: { description: 'Serviço criado' } } });
  registry.registerPath({ method: 'put', path: '/servicos/info/cliente/{id}', tags: ['Serviços'], security, responses: { 200: { description: 'OK' } } });
  registry.registerPath({ method: 'put', path: '/servicos/status/{id}/{status}', tags: ['Serviços'], security, responses: { 200: { description: 'OK' } } });
  registry.registerPath({ method: 'put', path: '/servicos/status/pagamento/{id}/{status}', tags: ['Serviços'], security, responses: { 200: { description: 'OK' } } });
  registry.registerPath({ method: 'delete', path: '/servicos/{id}/{cod}', tags: ['Serviços'], security, responses: { 204: { description: 'Removido' } } });

  // Order of service
  registry.registerPath({ method: 'get', path: '/ordem-servico', tags: ['Ordens de Serviço'], security, responses: { 200: { content: { 'application/json': { schema: orderOfServiceListResponseSchema } }, description: 'Lista' } } });
  registry.registerPath({ method: 'get', path: '/ordem-servico/{cod}', tags: ['Ordens de Serviço'], security, responses: { 200: { description: 'Detalhe' } } });
  registry.registerPath({ method: 'put', path: '/ordem-servico/orcamento/{cod}', tags: ['Ordens de Serviço'], security, responses: { 200: { description: 'OK' } } });
  registry.registerPath({ method: 'delete', path: '/ordem-servico/orcamento/{cod}/{idEstimate}', tags: ['Ordens de Serviço'], security, responses: { 204: { description: 'OK' } } });
}
