import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { orderOfServiceListResponseSchema, orderOfServiceResponseSchema, orderUpdateEstimateSchema } from './ordem-servico.schema.js';

export function registerOrdensServicoDocs(registry: OpenAPIRegistry) {
  const security = [{ bearerAuth: [] }];
  registry.registerPath({ method: 'get', path: '/ordens-servico', tags: ['Ordens de Serviço'], security, responses: { 200: { description: 'Ordens listadas', content: { 'application/json': { schema: orderOfServiceListResponseSchema } } } } });
  registry.registerPath({ method: 'get', path: '/ordens-servico/{cod}', tags: ['Ordens de Serviço'], security, responses: { 200: { description: 'Ordem detalhada', content: { 'application/json': { schema: orderOfServiceResponseSchema } } } } });
  registry.registerPath({ method: 'put', path: '/ordens-servico/{cod}/orcamento', tags: ['Ordens de Serviço'], security, request: { body: { required: true, content: { 'application/json': { schema: orderUpdateEstimateSchema } } } }, responses: { 200: { description: 'Orçamento atualizado' } } });
  registry.registerPath({ method: 'delete', path: '/ordens-servico/{cod}/orcamento/{idEstimate}', tags: ['Ordens de Serviço'], security, responses: { 204: { description: 'Item removido' } } });
}
