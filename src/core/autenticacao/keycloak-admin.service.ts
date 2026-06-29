import { env } from '../config/env.js';

interface Group {
  id: string;
  name: string;
  path: string;
  attributes?: Record<string, string[]>;
}

interface RealmRole {
  id: string;
  name: string;
  description?: string;
}

type CreateUserPayload = {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  attributes?: Record<string, string[]>;
};

function buildClientAuthParams() {
  const params: Record<string, string> = {
    client_id: env.keycloakClientId,
  };

  if (env.keycloakClientSecret) {
    params.client_secret = env.keycloakClientSecret;
  }

  return params;
}

export default class KeycloakAdminService {
  private static get realmBaseUrl() {
    return `${env.keycloakUrl}/realms/${env.keycloakRealm}`;
  }

  private static get adminBaseUrl() {
    return `${env.keycloakUrl}/admin/realms/${env.keycloakRealm}`;
  }

  private static async requestServiceAccountAdminToken() {
    if (!env.keycloakClientAdminId || !env.keycloakClientAdminSecret) {
      throw new Error('Credenciais do client admin não configuradas.');
    }

    const response = await fetch(`${env.keycloakUrl}/realms/${env.keycloakRealm}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.keycloakClientAdminId,
        client_secret: env.keycloakClientAdminSecret,
        grant_type: 'client_credentials',
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Falha ao autenticar via service account: ${error}`);
    }

    const data = await response.json() as { access_token: string };
    return data.access_token;
  }

  private static async requestMasterAdminToken() {
    const response = await fetch(`${env.keycloakUrl}/realms/master/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: 'admin-cli',
        grant_type: 'password',
        username: env.keycloakAdminUser,
        password: env.keycloakAdminPassword,
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Falha ao autenticar via admin-cli: ${error}`);
    }

    const data = await response.json() as { access_token: string };
    return data.access_token;
  }

  private static async validateAdminAccess(adminToken: string) {
    const response = await fetch(`${this.adminBaseUrl}/groups?max=1`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token admin sem permissão para consultar grupos: ${response.status} - ${error}`);
    }
  }

  static async login(username: string, password: string) {
    const response = await fetch(`${this.realmBaseUrl}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        ...buildClientAuthParams(),
        grant_type: 'password',
        username,
        password,
        scope: 'openid profile email',
      }).toString(),
    });

    if (!response.ok) {
      throw new Error('Credenciais inválidas ou erro no serviço de autenticação.');
    }

    return response.json() as Promise<any>;
  }

  static async renovarToken(renovarToken: string) {
    const response = await fetch(`${this.realmBaseUrl}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        ...buildClientAuthParams(),
        grant_type: 'refresh_token',
        refresh_token: renovarToken,
        scope: 'openid profile email',
      }).toString(),
    });

    if (!response.ok) {
      throw new Error('Falha ao renovar o token. Faça login novamente.');
    }

    return response.json();
  }

  static async logout(renovarToken: string) {
    const body = new URLSearchParams({
      ...buildClientAuthParams(),
      refresh_token: renovarToken,
    });

    const response = await fetch(`${this.realmBaseUrl}/protocol/openid-connect/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Falha ao encerrar a sessão no Keycloak: ${response.status} - ${error}`);
    }
  }

  static construirUrlAutorizacao(params: {
    redirectUri: string;
    state: string;
    codeChallenge: string;
    identityProvider?: string;
  }) {
    // Use the public URL so the browser can resolve it (internal Docker hostnames like
    // "keycloak:8080" are not reachable from outside the container network).
    const publicRealmBase = `${env.keycloakPublicUrl}/realms/${env.keycloakRealm}`;
    const url = new URL(`${publicRealmBase}/protocol/openid-connect/auth`);
    url.searchParams.set('client_id', env.keycloakClientId);
    url.searchParams.set('redirect_uri', params.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid profile email');
    url.searchParams.set('state', params.state);
    url.searchParams.set('code_challenge', params.codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');

    if (params.identityProvider) {
      url.searchParams.set('kc_idp_hint', params.identityProvider);
    }

    return url.toString();
  }

  static async trocarCodigoAutorizacao(code: string, redirectUri: string, codeVerifier: string): Promise<any> {
    const response = await fetch(`${this.realmBaseUrl}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        ...buildClientAuthParams(),
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }).toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Falha ao finalizar login no Keycloak: ${response.status} - ${error}`);
    }

    return response.json() as Promise<any>;
  }

  static async getAdminToken() {
    const errors: string[] = [];

    try {
      const serviceAccountToken = await this.requestServiceAccountAdminToken();
      await this.validateAdminAccess(serviceAccountToken);
      return serviceAccountToken;
    } catch (error: any) {
      errors.push(error.message || 'Falha desconhecida no service account.');
    }

    try {
      const masterAdminToken = await this.requestMasterAdminToken();
      await this.validateAdminAccess(masterAdminToken);
      return masterAdminToken;
    } catch (error: any) {
      errors.push(error.message || 'Falha desconhecida no admin-cli.');
    }

    throw new Error(`Não foi possível autenticar a administração. ${errors.join(' | ')}`);
  }

  static async findGroupByName(groupName: string, adminToken: string): Promise<Group | null> {
    const response = await fetch(`${this.adminBaseUrl}/groups?search=${encodeURIComponent(groupName)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao buscar grupos: ${response.status} - ${error}`);
    }

    const groups = await response.json() as Group[];
    return groups.find((group) => group.name === groupName) || null;
  }

  static async ensureGroupExists(groupName: string, adminToken: string) {
    const existingGroup = await this.findGroupByName(groupName, adminToken);
    if (existingGroup) {
      return { groupId: existingGroup.id, created: false };
    }

    const response = await fetch(`${this.adminBaseUrl}/groups`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: groupName }),
    });

    if (response.status !== 201) {
      const error = await response.text();
      throw new Error(`Falha ao criar grupo "${groupName}": ${response.status} - ${error}`);
    }

    const createdGroup = await this.findGroupByName(groupName, adminToken);
    if (!createdGroup) {
      throw new Error('Grupo criado mas não foi possível obter seu ID.');
    }

    return { groupId: createdGroup.id, created: true };
  }

  static async createUser(payload: CreateUserPayload, adminToken: string) {
    const response = await fetch(`${this.adminBaseUrl}/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: payload.username,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        enabled: true,
        credentials: [{
          type: 'password',
          value: payload.password,
          temporary: false,
        }],
        attributes: payload.attributes || {},
      }),
    });

    if (response.status !== 201) {
      const error = await response.text();
      throw new Error(`Falha ao criar usuário no IAM: ${response.status} - ${error}`);
    }

    const location = response.headers.get('Location');
    if (!location) {
      throw new Error('Usuário criado, mas não foi possível obter seu ID.');
    }

    return location.split('/').pop() as string;
  }

  static async addUserToGroup(userId: string, groupId: string, adminToken: string) {
    const response = await fetch(`${this.adminBaseUrl}/users/${userId}/groups/${groupId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Falha ao adicionar usuário ao grupo: ${response.status} - ${error}`);
    }
  }

  static async updateUserAttributes(userId: string, attributes: Record<string, string[]>, adminToken: string) {
    const response = await fetch(`${this.adminBaseUrl}/users/${userId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ attributes }),
    });

    console.log(response)
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Falha ao atualizar atributos do usuário: ${response.status} - ${error}`);
    }
  }

  static async deleteUser(userId: string, adminToken: string) {
    const response = await fetch(`${this.adminBaseUrl}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok && response.status !== 404) {
      const error = await response.text();
      throw new Error(`Falha ao remover usuário do IAM: ${response.status} - ${error}`);
    }
  }

  static async deleteGroup(groupId: string, adminToken: string) {
    const response = await fetch(`${this.adminBaseUrl}/groups/${groupId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok && response.status !== 404) {
      const error = await response.text();
      throw new Error(`Falha ao remover grupo do IAM: ${response.status} - ${error}`);
    }
  }

  static async getRealmRolesByNames(roleNames: string[], adminToken: string) {
    if (roleNames.length === 0) {
      return [];
    }

    const response = await fetch(`${this.adminBaseUrl}/roles`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Falha ao listar roles do IAM: ${response.status} - ${error}`);
    }

    const roles = await response.json() as RealmRole[];
    return roles.filter((role) => roleNames.includes(role.name));
  }

  static async assignRealmRoles(userId: string, roleNames: string[], adminToken: string) {
    if (roleNames.length === 0) {
      return;
    }

    const roles = await this.getRealmRolesByNames(roleNames, adminToken);
    const missingRoles = roleNames.filter((roleName) => !roles.some((role) => role.name === roleName));

    if (missingRoles.length > 0) {
      throw new Error(`Roles não encontradas no IAM: ${missingRoles.join(', ')}`);
    }

    const response = await fetch(`${this.adminBaseUrl}/users/${userId}/role-mappings/realm`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roles),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Falha ao atribuir roles ao usuário: ${response.status} - ${error}`);
    }
  }

  static async obterUsuarioRealmRoleNames(userId: string) {
    const adminToken = await this.getAdminToken();
    const response = await fetch(`${this.adminBaseUrl}/users/${userId}/role-mappings/realm`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Falha ao consultar roles do usuário: ${response.status} - ${error}`);
    }

    const roles = await response.json() as RealmRole[];
    return roles.map((role) => role.name);
  }
}
