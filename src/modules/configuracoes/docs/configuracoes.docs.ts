import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { statusPaymentSchema } from '../status-pagamento/status-pagamento.schema.ts';
import { statusServiceSchema } from '../status-servico/status-servico.schema.ts';
import { typeProductSchema } from '../tipos-produto/tipos-produto.schema.ts';

export function registerOperacionalDocs(registry: OpenAPIRegistry) {
  // Register Models
  registry.register('StatusServico', statusServiceSchema);
  registry.register('StatusPagamento', statusPaymentSchema);
  registry.register('TypeProduct', typeProductSchema);

  const security = [{ bearerAuth: [] }];

  // Status Service
  registry.registerPath({ method: 'get', path: '/status-servico', tags: ['Status de Serviço'], security, responses: { 200: { description: 'Lista' } } });
  registry.registerPath({ method: 'post', path: '/status-servico', tags: ['Status de Serviço'], security, responses: { 201: { description: 'OK' } } });
  registry.registerPath({ method: 'delete', path: '/status-servico/{id}', tags: ['Status de Serviço'], security, responses: { 204: { description: 'OK' } } });

  // Status Payment
  registry.registerPath({ method: 'get', path: '/status-pagamento', tags: ['Status de Pagamento'], security, responses: { 200: { description: 'Lista' } } });
  registry.registerPath({ method: 'post', path: '/status-pagamento', tags: ['Status de Pagamento'], security, responses: { 201: { description: 'OK' } } });
  registry.registerPath({ method: 'delete', path: '/status-pagamento/{id}', tags: ['Status de Pagamento'], security, responses: { 204: { description: 'OK' } } });

  // Types Product
  registry.registerPath({ method: 'get', path: '/tipos-produto', tags: ['Tipos de Produtos'], security, responses: { 200: { description: 'Lista' } } });
  registry.registerPath({ method: 'post', path: '/tipos-produto', tags: ['Tipos de Produtos'], security, responses: { 201: { description: 'OK' } } });
  registry.registerPath({ method: 'delete', path: '/tipos-produto/{id}', tags: ['Tipos de Produtos'], security, responses: { 204: { description: 'OK' } } });
}
