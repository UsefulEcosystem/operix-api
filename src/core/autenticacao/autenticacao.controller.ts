import type { Request, Response } from 'express';
import AutenticacaoService from './autenticacao.service.js';
import ManipuladorResposta from '../utils/manipulador-resposta.js';
import { sanitizarUsuario } from '../utils/sanitizar.js';
import PermissoesService from '../perfil/permissoes/permissoes.service.js';
import { env } from '../config/env.js';

function getRefreshTokenFromRequest(req: Request) {
  const cookieHeader = req.headers.cookie || '';
  const cookies = Object.fromEntries(
    cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const index = cookie.indexOf('=');
        return index >= 0
          ? [decodeURIComponent(cookie.slice(0, index)), decodeURIComponent(cookie.slice(index + 1))]
          : [decodeURIComponent(cookie), ''];
      }),
  );

  return cookies[env.refreshCookieName] || req.body?.refresh_token;
}

function getSessionContext(req: Request) {
  return {
    ip: req.ip || req.socket.remoteAddress || null,
    userAgent: req.headers['user-agent'] || null,
  };
}

function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(env.refreshCookieName, refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/api/autenticacao',
    maxAge: env.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(env.refreshCookieName, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/api/autenticacao',
  });
}

function sessionResponse(session: any) {
  return {
    token: session.token,
    expires_in: session.expires_in,
    refresh_expires_in: session.refresh_expires_in,
    token_type: session.token_type,
    user: session.user,
  };
}

export default class AutenticacaoController {
  static async config(_req: Request, res: Response) {
    try {
      const data = await AutenticacaoService.obterConfiguracaoPublica();
      return ManipuladorResposta.sucesso(res, data, 'Configuração de autenticação carregada.');
    } catch (error: any) {
      return ManipuladorResposta.erro(res, error.message || 'Erro ao carregar configuração.', 500);
    }
  }

  static async authorize(req: Request, res: Response) {
    try {
      const authorization_url = AutenticacaoService.construirUrlAutorizacao({
        redirectUri: req.body.redirect_uri,
        state: req.body.state,
        codeChallenge: req.body.code_challenge,
        identityProvider: req.body.identity_provider || 'google',
      });

      return ManipuladorResposta.sucesso(res, { authorization_url }, 'URL de autenticação gerada.');
    } catch (error: any) {
      return ManipuladorResposta.erro(res, error.message || 'Erro ao iniciar autenticação.', error.status || 400);
    }
  }

  static async callback(req: Request, res: Response) {
    try {
      const session = await AutenticacaoService.trocarCodigoAutorizacao(
        req.body.code,
        req.body.redirect_uri,
        req.body.code_verifier,
        getSessionContext(req),
      );

      setRefreshCookie(res, session.refreshToken);
      return ManipuladorResposta.sucesso(res, sessionResponse(session), 'Login realizado com sucesso.');
    } catch (error: any) {
      return ManipuladorResposta.erro(res, error.message || 'Erro ao finalizar login.', error.status || 401);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const session = await AutenticacaoService.login(username, password, getSessionContext(req));
      setRefreshCookie(res, session.refreshToken);
      return ManipuladorResposta.sucesso(res, sessionResponse(session), 'Login realizado com sucesso.');
    } catch (error: any) {
      return ManipuladorResposta.erro(res, error.message || 'Erro no login.', error.status || 401);
    }
  }

  static async registrar(req: Request, res: Response) {
    try {
      const data = await AutenticacaoService.registrar(req.body);
      return ManipuladorResposta.sucesso(res, data, 'Cadastro iniciado. Verifique seu e-mail para continuar.', 201);
    } catch (error: any) {
      return ManipuladorResposta.erro(res, error.message || 'Erro ao registrar usuário.', error.status || 400);
    }
  }

  static async verificarEmail(req: Request, res: Response) {
    try {
      const session = await AutenticacaoService.verificarEmail(req.body.token, getSessionContext(req));
      setRefreshCookie(res, session.refreshToken);
      return ManipuladorResposta.sucesso(res, sessionResponse(session), 'E-mail verificado com sucesso.');
    } catch (error: any) {
      return ManipuladorResposta.erro(res, error.message || 'Erro ao verificar e-mail.', error.status || 401);
    }
  }

  static async solicitarRecuperacaoSenha(req: Request, res: Response) {
    try {
      const data = await AutenticacaoService.solicitarRecuperacaoSenha(req.body.email);
      return ManipuladorResposta.sucesso(res, data, 'Se o e-mail existir, enviaremos instruções para redefinir a senha.');
    } catch (error: any) {
      return ManipuladorResposta.erro(res, error.message || 'Erro ao solicitar recuperação de senha.', error.status || 400);
    }
  }

  static async redefinirSenha(req: Request, res: Response) {
    try {
      const data = await AutenticacaoService.redefinirSenha(req.body);
      clearRefreshCookie(res);
      return ManipuladorResposta.sucesso(res, data, 'Senha redefinida com sucesso.');
    } catch (error: any) {
      return ManipuladorResposta.erro(res, error.message || 'Erro ao redefinir senha.', error.status || 400);
    }
  }

  static async renovarToken(req: Request, res: Response) {
    try {
      const session = await AutenticacaoService.renovarToken(getRefreshTokenFromRequest(req), getSessionContext(req));
      setRefreshCookie(res, session.refreshToken);
      return ManipuladorResposta.sucesso(res, sessionResponse(session), 'Refresh token realizado com sucesso!', 200);
    } catch (error: any) {
      clearRefreshCookie(res);
      return ManipuladorResposta.erro(res, error.message || 'Refresh token inválido ou expirado', error.status || 401);
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      const accessTokenPayload = accessToken ? AutenticacaoService.decodificarAccessTokenParaLogout(accessToken) : null;
      await AutenticacaoService.logout(getRefreshTokenFromRequest(req), accessTokenPayload || undefined);
      clearRefreshCookie(res);
      return ManipuladorResposta.sucesso(res, null, 'Logout realizado com sucesso.', 200);
    } catch (error: any) {
      clearRefreshCookie(res);
      return ManipuladorResposta.erro(res, error.message || 'Erro ao realizar logout.', error.status || 400);
    }
  }

  static async me(req: Request, res: Response) {
    const snapshot = await PermissoesService.obterPermissoesUsuarioAtual((req as any).user);
    return ManipuladorResposta.sucesso(res, {
      user: sanitizarUsuario((req as any).user),
      permissions: snapshot.effective_permissions,
      access: snapshot.access,
    }, 'Sessão carregada.');
  }

  static async concluirOnboarding(req: Request, res: Response) {
    try {
      const data = await AutenticacaoService.concluirOnboarding((req as any).user, req.body);
      return ManipuladorResposta.sucesso(res, data, 'Onboarding concluído com sucesso.', 201);
    } catch (error: any) {
      return ManipuladorResposta.erro(res, error.message || 'Erro ao concluir onboarding.', error.status || 400);
    }
  }
}
