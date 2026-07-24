import AutenticacaoController from '../../src/core/autenticacao/autenticacao.controller.js';
import AutenticacaoService from '../../src/core/autenticacao/autenticacao.service.js';
import PermissoesService from '../../src/core/permissoes/permissoes.service.js';
import { criarRequestMock, criarResponseMock } from '../support/mocks-express.js';

describe('Testes de Integração - Rotas de Autenticação', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('config retorna configuração pública', async () => {
    jest.spyOn(AutenticacaoService, 'obterConfiguracaoPublica').mockResolvedValue({
      deployment_mode: 'LOCAL',
      tenant_count: 0,
      registration_enabled: true,
      onboarding_enabled: true,
      local_instance_configured: false,
      auth: {
        access_token_ttl_seconds: 900,
        refresh_token_ttl_days: 30,
        google_enabled: true,
      },
    } as any);
    const res = criarResponseMock();

    await AutenticacaoController.config(criarRequestMock(), res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Configuração de autenticação carregada.',
      data: expect.objectContaining({
        auth: expect.objectContaining({ google_enabled: true }),
      }),
    }));
  });

  test('me retorna snapshot da sessão autenticada', async () => {
    jest.spyOn(PermissoesService, 'obterPermissoesUsuarioAtual').mockResolvedValue({
      effective_permissions: ['usuarios.acesso'],
      access: { plan: 'trial' },
    } as any);
    const req = criarRequestMock({ user: { id: 1, username: 'admin', tenant_id: 1 } });
    const res = criarResponseMock();

    await AutenticacaoController.me(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Sessão carregada.',
      data: expect.objectContaining({
        permissions: ['usuarios.acesso'],
      }),
    }));
  });

  test('callback cria cookie de refresh e retorna sessão sem expor refresh token', async () => {
    jest.spyOn(AutenticacaoService, 'trocarCodigoAutorizacao').mockResolvedValue({
      token: 'access-token',
      refreshToken: 'refresh-token',
      expires_in: 300,
      refresh_expires_in: 1800,
      token_type: 'Bearer',
      user: {
        id: 5,
        sub: '5',
        username: 'user',
        email: 'user@opeflow.dev',
        tenant_id: 1,
        roles: ['modulo:organizacao'],
      },
    } as any);

    const req = criarRequestMock({
      body: {
        code: 'auth-code',
        redirect_uri: 'http://localhost:5173/#/auth/callback',
        code_verifier: 'verifier-1234567890123456',
      },
    });
    const res = criarResponseMock();

    await AutenticacaoController.callback(req, res);

    expect(res.cookie).toHaveBeenCalledWith('opeflow_refresh_token', 'refresh-token', expect.objectContaining({
      httpOnly: true,
      sameSite: 'lax',
      path: '/api/autenticacao',
    }));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Login realizado com sucesso.',
      data: expect.objectContaining({
        token: 'access-token',
        user: expect.objectContaining({
          sub: '5',
        }),
      }),
    }));
    expect(res.json.mock.calls[0][0].data.refreshToken).toBeUndefined();
    expect(res.json.mock.calls[0][0].data.refresh_token).toBeUndefined();
  });

  test('refresh rotaciona cookie e devolve o mesmo contrato de sessão do login', async () => {
    jest.spyOn(AutenticacaoService, 'renovarToken').mockResolvedValue({
      token: 'new-access-token',
      refreshToken: 'new-refresh-token',
      expires_in: 300,
      refresh_expires_in: 1800,
      token_type: 'Bearer',
      user: {
        id: 8,
        sub: '8',
        username: 'refresh.user',
        email: 'refresh@opeflow.dev',
        tenant_id: 3,
        roles: ['modulo:estoque'],
      },
    } as any);

    const req = criarRequestMock({ body: { refresh_token: 'refresh-token' } });
    const res = criarResponseMock();

    await AutenticacaoController.renovarToken(req, res);

    expect(AutenticacaoService.renovarToken).toHaveBeenCalledWith('refresh-token', expect.objectContaining({
      ip: '127.0.0.1',
    }));
    expect(res.cookie).toHaveBeenCalledWith('opeflow_refresh_token', 'new-refresh-token', expect.any(Object));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Refresh token realizado com sucesso!',
      data: expect.objectContaining({
        token: 'new-access-token',
        user: expect.objectContaining({
          sub: '8',
        }),
      }),
    }));
    expect(res.json.mock.calls[0][0].data.refresh_token).toBeUndefined();
  });

  test('registrar cria tenant placeholder e retorna sessão do usuário', async () => {
    jest.spyOn(AutenticacaoService, 'registrar').mockResolvedValue({
      token: 'access-token',
      refreshToken: 'refresh-token',
      expires_in: 300,
      refresh_expires_in: 1800,
      token_type: 'Bearer',
      user: { id: 5, sub: '5', email: 'admin@opeflow.dev' },
      is_new_user: true
    } as any);

    const payload = {
      email: 'admin@opeflow.dev',
      password: 'secret123',
      confirm_password: 'secret123',
    };
    const req = criarRequestMock({ body: payload });
    const res = criarResponseMock();

    await AutenticacaoController.registrar(req, res);

    expect(AutenticacaoService.registrar).toHaveBeenCalledWith(payload, expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      msg: 'Cadastro realizado com sucesso.',
      data: expect.objectContaining({
        token: 'access-token',
        is_new_user: true,
      }),
    }));
  });

  test('login interno cria sessão usando código da empresa e usuário', async () => {
    jest.spyOn(AutenticacaoService, 'loginInterno').mockResolvedValue({
      token: 'internal-access-token',
      refreshToken: 'internal-refresh-token',
      expires_in: 300,
      refresh_expires_in: 1800,
      token_type: 'Bearer',
      user: {
        id: 9,
        sub: '9',
        username: 'maria',
        email: null,
        tenant_id: 3,
        roles: ['modulo:estoque'],
      },
    } as any);
    const payload = {
      company_code: 'OPE-ABCD-2345',
      username: 'maria',
      password: 'secret123',
    };
    const req = criarRequestMock({ body: payload });
    const res = criarResponseMock();

    await AutenticacaoController.loginInterno(req, res);

    expect(AutenticacaoService.loginInterno).toHaveBeenCalledWith(payload, expect.any(Object));
    expect(res.cookie).toHaveBeenCalledWith(
      'opeflow_refresh_token',
      'internal-refresh-token',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      msg: 'Acesso interno realizado com sucesso.',
      data: expect.objectContaining({
        token: 'internal-access-token',
        user: expect.objectContaining({ username: 'maria', tenant_id: 3 }),
      }),
    }));
  });

  test('concluirOnboarding delega dados autenticados ao serviço', async () => {
    jest.spyOn(AutenticacaoService, 'concluirOnboarding').mockResolvedValue({ id: 1, tenant_id: 10, admin: true } as any);
    const payload = {
      company_name: 'Opeflow',
      name: 'Admin',
      username: 'admin',
    };
    const user = { id: 1, email: 'admin@opeflow.dev', tenant_id: null };
    const req = criarRequestMock({ body: payload, user });
    const res = criarResponseMock();

    await AutenticacaoController.concluirOnboarding(req, res);

    expect(AutenticacaoService.concluirOnboarding).toHaveBeenCalledWith(user, payload);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('checkEmail verifica existência do e-mail na API', async () => {
    jest.spyOn(AutenticacaoService, 'verificarExistenciaEmail').mockResolvedValue({
      exists: true,
      active: true,
    });

    const req = criarRequestMock({ body: { email: 'admin@opeflow.dev' } });
    const res = criarResponseMock();

    await AutenticacaoController.checkEmail(req, res);

    expect(AutenticacaoService.verificarExistenciaEmail).toHaveBeenCalledWith('admin@opeflow.dev');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: { exists: true, active: true },
    }));
  });
});
