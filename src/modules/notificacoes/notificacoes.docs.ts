import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

export function registerNotificacoesDocs(registry: OpenAPIRegistry) {
  registry.registerPath({
    method: 'get',
    path: '/notificacoes',
    tags: ['Notificações'],
    security: [{ bearerAuth: [] }],
    responses: { 200: { description: 'Notificações listadas' } },
  });
}
