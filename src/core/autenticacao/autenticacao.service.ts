import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import ErroValidacao from '../utils/erro-validacao.js';
import LocatarioModel from '../perfil/locatarios/locatarios.model.js';
import LocatarioRepository from '../perfil/locatarios/locatarios.repository.js';
import UsuariosRepository from '../perfil/usuarios/usuarios.repository.js';
import UsuarioModel from '../perfil/usuarios/usuarios.model.js';
import { sanitizarUsuario } from '../utils/sanitizar.js';
import PoliticaLocatarioService from '../perfil/locatarios/politica-locatario.service.js';
import PermissoesService from '../perfil/permissoes/permissoes.service.js';
import { env } from '../config/env.js';
import RefreshTokenRepository from './refresh-token.repository.js';
import AccessTokenBlacklistRepository from './access-token-blacklist.repository.js';
import AuthActionTokenRepository from './auth-action-token.repository.js';
import EmailDeliveryService from './email-delivery.service.js';

type SessionContext = {
  ip?: string | null;
  userAgent?: string | null;
};

type JwtPayload = {
  sub: string;
  tenant_id: number | null;
  email: string;
  username: string;
  roles: string[];
  admin: boolean;
  root: boolean;
  jti: string;
};

type GoogleTokenPayload = {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
};

let googleJwksCache: { expiresAt: number; keys: any[] } | null = null;

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function addHours(date: Date, hours: number) {
  const copy = new Date(date);
  copy.setHours(copy.getHours() + hours);
  return copy;
}

function buildFrontendUrl(path: string, token: string) {
  const baseUrl = env.frontendUrl.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}/#${normalizedPath}?token=${encodeURIComponent(token)}`;
}

function buildAuthActionResponse(urlKey: 'verification_url' | 'reset_url', url: string) {
  return env.nodeEnv === 'production' ? {} : { [urlKey]: url };
}

async function getGoogleJwks() {
  if (googleJwksCache && googleJwksCache.expiresAt > Date.now()) {
    return googleJwksCache.keys;
  }

  const response = await fetch(env.googleJwksUri);
  if (!response.ok) {
    throw new ErroValidacao('Não foi possível validar a conta Google.', 401);
  }

  const cacheControl = response.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAge = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;
  const payload: any = await response.json();
  googleJwksCache = {
    expiresAt: Date.now() + maxAge * 1000,
    keys: payload.keys || [],
  };

  return googleJwksCache.keys;
}

async function getGooglePublicKey(header: any, callback: jwt.SigningKeyCallback) {
  try {
    const keys = await getGoogleJwks();
    const jwk = keys.find((key) => key.kid === header.kid);
    if (!jwk) {
      callback(new Error('Chave Google não encontrada.'));
      return;
    }

    const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' }).export({ type: 'spki', format: 'pem' });
    callback(null, publicKey);
  } catch (error) {
    callback(error as Error);
  }
}

export default class AutenticacaoService {
  static async obterConfiguracaoPublica() {
    const tenantState = await PoliticaLocatarioService.obterEstadoPublico();
    return {
      ...tenantState,
      auth: {
        access_token_ttl_seconds: env.accessTokenTtlSeconds,
        refresh_token_ttl_days: env.refreshTokenTtlDays,
        google_enabled: Boolean(env.googleClientId && env.googleClientSecret),
      },
    };
  }

  static construirUrlAutorizacao(params: {
    redirectUri: string;
    state: string;
    codeChallenge: string;
    identityProvider?: string;
  }) {
    if ((params.identityProvider || 'google') !== 'google') {
      throw new ErroValidacao('Provedor de identidade não suportado.', 400);
    }

    if (!env.googleClientId) {
      throw new ErroValidacao('Login Google não configurado.', 400);
    }

    const url = new URL(env.googleAuthUrl);
    url.searchParams.set('client_id', env.googleClientId);
    url.searchParams.set('redirect_uri', params.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('state', params.state);
    url.searchParams.set('code_challenge', params.codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'select_account');

    return url.toString();
  }

  static async trocarCodigoAutorizacao(code: string, redirectUri: string, codeVerifier: string, context: SessionContext = {}) {
    if (!env.googleClientId || !env.googleClientSecret) {
      throw new ErroValidacao('Login Google não configurado.', 400);
    }

    const response = await fetch(env.googleTokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.googleClientId,
        client_secret: env.googleClientSecret,
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData: any = await response.json().catch(() => ({}));
    if (!response.ok || !tokenData.id_token) {
      throw new ErroValidacao(tokenData.error_description || 'Falha ao autenticar com Google.', 401);
    }

    const googleUser = await this.validarIdTokenGoogle(tokenData.id_token);
    if (!googleUser.email || googleUser.email_verified === false || googleUser.email_verified === 'false') {
      throw new ErroValidacao('Conta Google sem e-mail verificado.', 401);
    }

    const user = await UsuariosRepository.findByEmail(googleUser.email);
    if (!user || user.active === false || !user.password || !user.email_verified_at) {
      throw new ErroValidacao('Usuário Google não cadastrado ou inativo.', 401);
    }

    return this.criarSessao(user, context);
  }

  static async login(username: string, password: string, context: SessionContext = {}) {
    const user = await UsuariosRepository.findByLogin(username);
    if (!user || user.active === false || !user.password) {
      throw new ErroValidacao('Usuário ou senha inválidos.', 401);
    }

    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      throw new ErroValidacao('Usuário ou senha inválidos.', 401);
    }

    if (!user.email_verified_at) {
      throw new ErroValidacao('E-mail ainda não verificado. Verifique sua caixa de entrada para continuar.', 403);
    }

    return this.criarSessao(user, context);
  }

  static async registrar(data: { email: string }) {
    const email = data.email.trim().toLowerCase();
    const existingUser = await UsuariosRepository.findByEmail(email);
    if (existingUser) {
      throw new ErroValidacao('E-mail já cadastrado.', 409);
    }

    const user = await UsuariosRepository.criar(new UsuarioModel({
      tenant_id: null,
      name: email.split('@')[0],
      username: `pending_${crypto.randomUUID().slice(0, 8)}`,
      email,
      root: true,
      admin: true,
      active: false,
      preferences: {},
      password: null,
    }));

    const setup = await this.criarTokenAcao(user.id, 'password_setup', 24);
    const setupUrl = buildFrontendUrl('/definir-senha', setup.token);
    await EmailDeliveryService.enviarEmailAutenticacao({
      to: email,
      purpose: 'password_setup',
      url: setupUrl,
    });

    return {
      email,
      setup_required: true,
      ...buildAuthActionResponse('setup_url', setupUrl),
    };
  }

  static async definirSenha(data: { token: string; password: string; confirm_password: string }, context: SessionContext = {}) {
    const storedToken = await AuthActionTokenRepository.buscarAtivoPorHash(hashToken(data.token), 'password_setup');
    if (!storedToken) {
      throw new ErroValidacao('Token de criação de senha inválido ou expirado.', 401);
    }

    const user = await UsuariosRepository.findById(storedToken.user_id);
    if (!user) {
      throw new ErroValidacao('Usuário inativo ou inexistente.', 401);
    }

    await UsuariosRepository.atualizarSenha(user.id, await argon2.hash(data.password));
    const updatedUser = await UsuariosRepository.marcarEmailVerificado(user.id);
    await AuthActionTokenRepository.marcarUsado(storedToken.id);
    if (!updatedUser || updatedUser.active === false) {
      throw new ErroValidacao('Usuário inativo ou inexistente.', 401);
    }

    return this.criarSessao(updatedUser, context);
  }

  static async solicitarRecuperacaoSenha(emailInput: string) {
    const email = emailInput.trim().toLowerCase();
    const user = await UsuariosRepository.findByEmail(email);
    if (!user || !user.password || user.active === false) {
      return { accepted: true };
    }

    const reset = await this.criarTokenAcao(user.id, 'password_reset', 1);
    const resetUrl = buildFrontendUrl('/redefinir-senha', reset.token);
    await EmailDeliveryService.enviarEmailAutenticacao({
      to: user.email,
      purpose: 'password_reset',
      url: resetUrl,
    });

    return {
      accepted: true,
      ...buildAuthActionResponse('reset_url', resetUrl),
    };
  }

  static async redefinirSenha(data: { token: string; password: string; confirm_password: string }) {
    const storedToken = await AuthActionTokenRepository.buscarAtivoPorHash(hashToken(data.token), 'password_reset');
    if (!storedToken) {
      throw new ErroValidacao('Token de recuperação inválido ou expirado.', 401);
    }

    const user = await UsuariosRepository.findById(storedToken.user_id);
    if (!user || user.active === false) {
      throw new ErroValidacao('Usuário inativo ou inexistente.', 401);
    }

    await UsuariosRepository.atualizarSenha(user.id, await argon2.hash(data.password));
    await AuthActionTokenRepository.marcarUsado(storedToken.id);
    await RefreshTokenRepository.revogarTodosDoUsuario(user.id);
    return { accepted: true };
  }

  static async renovarToken(refreshToken: string | undefined, context: SessionContext = {}) {
    if (!refreshToken) {
      throw new ErroValidacao('Refresh token não informado.', 401);
    }

    const tokenHash = hashToken(refreshToken);
    const storedToken = await RefreshTokenRepository.buscarAtivoPorHash(tokenHash);
    if (!storedToken) {
      const knownToken = await RefreshTokenRepository.buscarPorHash(tokenHash);
      if (knownToken?.user_id && knownToken.revoked_at) {
        await RefreshTokenRepository.revogarTodosDoUsuario(knownToken.user_id);
      }

      throw new ErroValidacao('Refresh token inválido ou expirado.', 401);
    }

    const user = await UsuariosRepository.findById(storedToken.user_id);
    if (!user || user.active === false) {
      await RefreshTokenRepository.revogar(storedToken.id);
      throw new ErroValidacao('Sessão inválida.', 401);
    }

    const session = await this.criarSessao(user, context);
    await RefreshTokenRepository.revogar(storedToken.id, session.refreshTokenId);
    return session;
  }

  static async logout(refreshToken?: string, accessTokenPayload?: Partial<JwtPayload & jwt.JwtPayload>) {
    if (refreshToken) {
      const storedToken = await RefreshTokenRepository.buscarAtivoPorHash(hashToken(refreshToken));
      if (storedToken) {
        await RefreshTokenRepository.revogar(storedToken.id);
      }
    }

    if (accessTokenPayload?.jti && accessTokenPayload.exp && accessTokenPayload.exp * 1000 > Date.now()) {
      await AccessTokenBlacklistRepository.adicionar(
        accessTokenPayload.jti,
        new Date(accessTokenPayload.exp * 1000),
        accessTokenPayload.sub ? Number(accessTokenPayload.sub) : null,
      );
    }
  }

  static async cadastrar(data: {
    company_name?: string;
    tenant?: string;
    name: string;
    username: string;
    email: string;
    password: string;
    cnpj?: string | null;
    description?: string | null;
  }) {
    const tenantName = (data.company_name || data.tenant || '').trim();
    if (!tenantName) {
      throw new ErroValidacao('Nome da empresa é obrigatório.', 400);
    }

    return PoliticaLocatarioService.comBloqueioProvisionamentoLocatario(async () => {
      await PoliticaLocatarioService.assertLocatarioCanBeCreated();

      const existingTenant = await LocatarioRepository.findByName(tenantName);
      if (existingTenant) {
        throw new ErroValidacao('Unidade já cadastrada.', 409);
      }

      if (await UsuariosRepository.findByLogin(data.email)) {
        throw new ErroValidacao('E-mail já cadastrado.', 409);
      }

      if (await UsuariosRepository.findByLogin(data.username)) {
        throw new ErroValidacao('Nome de usuário já cadastrado.', 409);
      }

      let tenant: any = null;
      try {
        tenant = await LocatarioRepository.criar(LocatarioModel.deRequisicao({
          name: tenantName,
          cnpj: data.cnpj?.trim(),
          description: data.description?.trim(),
        }));

        const passwordHash = await argon2.hash(data.password);
        const localUser = await UsuariosRepository.criar(new UsuarioModel({
          tenant_id: tenant.id,
          name: data.name,
          username: data.username,
          email: data.email,
          root: true,
          admin: true,
          active: true,
          preferences: {},
          password: passwordHash,
        }));

        return sanitizarUsuario(localUser);
      } catch (error) {
        if (tenant?.id) {
          await LocatarioRepository.remover(tenant.id);
        }
        throw error;
      }
    });
  }

  static async concluirOnboarding(authenticatedUser: any, data: any) {
    if (authenticatedUser?.tenant_id) {
      return sanitizarUsuario(authenticatedUser);
    }

    if (!authenticatedUser?.id) {
      throw new ErroValidacao('Usuário autenticado não identificado.', 401);
    }

    const tenantName = (data.company_name || data.tenant || '').trim();
    if (!tenantName) {
      throw new ErroValidacao('Nome da empresa é obrigatório.', 400);
    }

    return PoliticaLocatarioService.comBloqueioProvisionamentoLocatario(async () => {
      await PoliticaLocatarioService.assertLocatarioCanBeCreated();

      const existingTenant = await LocatarioRepository.findByName(tenantName);
      if (existingTenant) {
        throw new ErroValidacao('Unidade já cadastrada.', 409);
      }

      const existingUsername = await UsuariosRepository.findByUsername(data.username);
      if (existingUsername && existingUsername.id !== authenticatedUser.id) {
        throw new ErroValidacao('Nome de usuário já cadastrado.', 409);
      }

      let tenant: any = null;
      try {
        tenant = await LocatarioRepository.criar(LocatarioModel.deRequisicao({
          name: tenantName,
          cnpj: data.cnpj?.trim(),
          description: data.description?.trim(),
        }));

        const user = await UsuariosRepository.completarOnboarding(authenticatedUser.id, {
          tenant_id: tenant.id,
          name: data.name,
          username: data.username,
        });

        return sanitizarUsuario(user);
      } catch (error) {
        if (tenant?.id) {
          await LocatarioRepository.remover(tenant.id);
        }
        throw error;
      }
    });
  }

  static async verificarAccessToken(token: string) {
    const payload = jwt.verify(token, env.jwtSecret, {
      algorithms: ['HS256'],
      issuer: env.jwtIssuer,
      audience: env.jwtAudience,
    }) as JwtPayload & jwt.JwtPayload;

    if (!payload.jti || await AccessTokenBlacklistRepository.existe(payload.jti)) {
      throw new ErroValidacao('Token revogado.', 401);
    }

    const user = await UsuariosRepository.findById(Number(payload.sub));
    if (!user || user.active === false) {
      throw new ErroValidacao('Usuário inativo ou inexistente.', 401);
    }

    const roles = PermissoesService.obterRolesLocais(user);
    return {
      ...user,
      sub: String(user.id),
      roles,
      tenant_id: user.tenant_id,
      onboarding_required: !user.tenant_id,
    };
  }

  static decodificarAccessTokenParaLogout(token: string) {
    try {
      return jwt.verify(token, env.jwtSecret, {
        algorithms: ['HS256'],
        issuer: env.jwtIssuer,
        audience: env.jwtAudience,
        ignoreExpiration: true,
      }) as JwtPayload & jwt.JwtPayload;
    } catch {
      return null;
    }
  }

  private static async criarSessao(user: any, context: SessionContext) {
    const roles = PermissoesService.obterRolesLocais(user);
    const jti = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const accessToken = jwt.sign(
      {
        sub: String(user.id),
        tenant_id: user.tenant_id,
        email: user.email,
        username: user.username,
        roles,
        admin: Boolean(user.admin),
        root: Boolean(user.root),
        jti,
        nbf: now,
      },
      env.jwtSecret,
      {
        algorithm: 'HS256',
        issuer: env.jwtIssuer,
        audience: env.jwtAudience,
        expiresIn: env.accessTokenTtlSeconds,
      },
    );

    const refreshToken = crypto.randomBytes(48).toString('base64url');
    const refreshTokenRow = await RefreshTokenRepository.criar({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      jti: crypto.randomUUID(),
      expiresAt: addDays(new Date(), env.refreshTokenTtlDays),
      ip: context.ip,
      userAgent: context.userAgent,
    });

    return {
      token: accessToken,
      refreshToken,
      refreshTokenId: refreshTokenRow.id,
      expires_in: env.accessTokenTtlSeconds,
      refresh_expires_in: env.refreshTokenTtlDays * 24 * 60 * 60,
      token_type: 'Bearer',
      user: sanitizarUsuario({
        ...user,
        sub: String(user.id),
        roles,
      }),
    };
  }

  private static async criarTokenAcao(
    userId: number,
    purpose: 'password_setup' | 'email_verification' | 'password_reset',
    ttlHours: number,
  ) {
    await AuthActionTokenRepository.revogarAtivosDoUsuario(userId, purpose);
    const token = crypto.randomBytes(48).toString('base64url');
    await AuthActionTokenRepository.criar({
      userId,
      purpose,
      tokenHash: hashToken(token),
      expiresAt: addHours(new Date(), ttlHours),
    });
    return { token };
  }

  private static validarIdTokenGoogle(idToken: string) {
    return new Promise<GoogleTokenPayload>((resolve, reject) => {
      jwt.verify(
        idToken,
        getGooglePublicKey,
        {
          algorithms: ['RS256'],
          audience: env.googleClientId,
          issuer: ['https://accounts.google.com', 'accounts.google.com'],
        },
        (error, decoded) => {
          if (error) {
            reject(new ErroValidacao('Token Google inválido.', 401));
            return;
          }

          resolve(decoded as GoogleTokenPayload);
        },
      );
    });
  }
}
