import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

export function registerLogsDocs(registry: OpenAPIRegistry) {
  const security = [{ bearerAuth: [] }];

  registry.registerPath({ method: 'get', path: '/logs', tags: ['Logs'], security, responses: { 200: { description: 'Logs encontrados com sucesso' } } });
}
