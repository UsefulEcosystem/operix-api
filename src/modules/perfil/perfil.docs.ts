import type { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import {
  companySettingsResponseSchema,
  companySettingsUpdateSchema,
  profileMeResponseSchema,
  profileSystemResponseSchema,
  userProfileUpdateSchema,
} from './configuracoes-perfil.schema.js';
import { tenantCreateSchema, tenantListResponseSchema, tenantSchema } from '../locatarios/locatarios.schema.js';
import {
  userAccessUpdateSchema,
  userCreateSchema,
  userListResponseSchema,
  userPublicSchema,
  userResponseSchema,
} from '../usuarios/usuarios.schema.js';
import {
  permissionOverridesUpdateSchema,
  permissionsCatalogResponseSchema,
  permissionsMeResponseSchema,
  permissionsUserResponseSchema,
} from '../../core/permissoes/permissoes.schema.js';

export function registerProfileDocs(registry: OpenAPIRegistry) {
  registry.register('User', userPublicSchema);
  registry.register('Tenant', tenantSchema);

  const security = [{ bearerAuth: [] }];

  registry.registerPath({
    method: 'get',
    path: '/usuarios',
    tags: ['Usuários'],
    security,
    responses: {
      200: {
        description: 'Lista de usuários',
        content: { 'application/json': { schema: userListResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/usuarios',
    tags: ['Usuários'],
    security,
    request: {
      body: {
        content: { 'application/json': { schema: userCreateSchema } },
        required: true,
      },
    },
    responses: {
      201: {
        description: 'Usuário criado com sucesso',
        content: { 'application/json': { schema: userResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/usuarios/{id}',
    tags: ['Usuários'],
    security,
    responses: {
      204: { description: 'Usuário removido com sucesso' },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/usuarios/{id}/acesso',
    tags: ['Usuários'],
    security,
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: userAccessUpdateSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Acesso do usuário atualizado com sucesso',
        content: { 'application/json': { schema: userResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/perfil/eu',
    tags: ['Usuários'],
    security,
    responses: {
      200: {
        description: 'Perfil do usuário autenticado',
        content: { 'application/json': { schema: profileMeResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/perfil/eu',
    tags: ['Usuários'],
    security,
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: userProfileUpdateSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Perfil do usuário atualizado com sucesso',
        content: { 'application/json': { schema: profileMeResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/perfil/empresa',
    tags: ['Unidades'],
    security,
    responses: {
      200: {
        description: 'Empresa do tenant autenticado',
        content: { 'application/json': { schema: companySettingsResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'patch',
    path: '/perfil/empresa',
    tags: ['Unidades'],
    security,
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: companySettingsUpdateSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Empresa atualizada com sucesso',
        content: { 'application/json': { schema: companySettingsResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/perfil/sistema',
    tags: ['Permissões'],
    security,
    responses: {
      200: {
        description: 'Configurações e catálogo efetivo do sistema',
        content: { 'application/json': { schema: profileSystemResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/locatarios',
    tags: ['Unidades'],
    security,
    responses: {
      200: {
        description: 'Lista de unidades',
        content: { 'application/json': { schema: tenantListResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'post',
    path: '/locatarios',
    tags: ['Unidades'],
    security,
    request: { body: { content: { 'application/json': { schema: tenantCreateSchema } }, required: true } },
    responses: {
      201: { description: 'Unidade criada com sucesso' },
    },
  });

  registry.registerPath({
    method: 'delete',
    path: '/locatarios/{id}',
    tags: ['Unidades'],
    security,
    responses: {
      204: { description: 'Unidade removida com sucesso' },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/permissoes/me',
    tags: ['Permissões'],
    security,
    responses: {
      200: {
        description: 'Permissões efetivas do usuário autenticado',
        content: { 'application/json': { schema: permissionsMeResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/permissoes/catalogo',
    tags: ['Permissões'],
    security,
    responses: {
      200: {
        description: 'Catálogo de permissões e módulos gerenciáveis',
        content: { 'application/json': { schema: permissionsCatalogResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'get',
    path: '/permissoes/usuarios/{id}',
    tags: ['Permissões'],
    security,
    responses: {
      200: {
        description: 'Perfil de permissões de um usuário do tenant',
        content: { 'application/json': { schema: permissionsUserResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: 'put',
    path: '/permissoes/usuarios/{id}',
    tags: ['Permissões'],
    security,
    request: {
      body: {
        required: true,
        content: {
          'application/json': {
            schema: permissionOverridesUpdateSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Overrides de permissões atualizados com sucesso',
        content: { 'application/json': { schema: permissionsUserResponseSchema } },
      },
    },
  });

}
