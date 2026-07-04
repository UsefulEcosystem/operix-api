import AutenticacaoController from '../../src/core/autenticacao/autenticacao.controller.js';
import AutenticacaoService from '../../src/core/autenticacao/autenticacao.service.js';
import PermissoesService from '../../src/core/perfil/permissoes/permissoes.service.js';
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
      effective_permissions: ['organization.users.access'],
      access: { plan: 'trial' },
    } as any);
    const req = criarRequestMock({ user: { id: 1, username: 'admin', tenant_id: 1 } });
    const res = criarResponseMock();

    await AutenticacaoController.me(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Sessão carregada.',
      data: expect.objectContaining({
        permissions: ['organization.users.access'],
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
        email: 'user@operix.dev',
        tenant_id: 1,
        roles: ['module:organization'],
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

    expect(res.cookie).toHaveBeenCalledWith('operix_refresh_token', 'refresh-token', expect.objectContaining({
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
        email: 'refresh@operix.dev',
        tenant_id: 3,
        roles: ['module:inventory'],
      },
    } as any);

    const req = criarRequestMock({ body: { refresh_token: 'refresh-token' } });
    const res = criarResponseMock();

    await AutenticacaoController.renovarToken(req, res);

    expect(AutenticacaoService.renovarToken).toHaveBeenCalledWith('refresh-token', expect.objectContaining({
      ip: '127.0.0.1',
    }));
    expect(res.cookie).toHaveBeenCalledWith('operix_refresh_token', 'new-refresh-token', expect.any(Object));
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

  test('registrar inicia cadastro mínimo com verificação de e-mail', async () => {
    jest.spyOn(AutenticacaoService, 'registrar').mockResolvedValue({
      email: 'admin@operix.dev',
      verification_required: true,
    } as any);

    const payload = {
      email: 'admin@operix.dev',
      password: 'secret123',
      confirm_password: 'secret123',
    };
    const req = criarRequestMock({ body: payload });
    const res = criarResponseMock();

    await AutenticacaoController.registrar(req, res);

    expect(AutenticacaoService.registrar).toHaveBeenCalledWith(payload);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('concluirOnboarding delega dados autenticados ao serviço', async () => {
    jest.spyOn(AutenticacaoService, 'concluirOnboarding').mockResolvedValue({ id: 1, tenant_id: 10, admin: true } as any);
    const payload = {
      company_name: 'Operix',
      name: 'Admin',
      username: 'admin',
    };
    const user = { id: 1, email: 'admin@operix.dev', tenant_id: null };
    const req = criarRequestMock({ body: payload, user });
    const res = criarResponseMock();

    await AutenticacaoController.concluirOnboarding(req, res);

    expect(AutenticacaoService.concluirOnboarding).toHaveBeenCalledWith(user, payload);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
