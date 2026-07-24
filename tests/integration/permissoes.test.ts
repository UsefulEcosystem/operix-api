import PermissoesController from '../../src/core/permissoes/permissoes.controller.js';
import PermissoesService from '../../src/core/permissoes/permissoes.service.js';
import { criarRequestMock, criarResponseMock } from '../support/mocks-express.js';

describe('Testes de Integração - Permissões', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('obterMeuPerfil retorna permissões efetivas do usuário autenticado', async () => {
    jest.spyOn(PermissoesService, 'obterPermissoesUsuarioAtual').mockResolvedValue({
      effective_permissions: ['usuarios.acesso'],
      permissions: [],
      access: { plan: 'trial' },
    } as any);
    const req = criarRequestMock({ user: { id: 1, roles: ['modulo:organizacao'] } });
    const res = criarResponseMock();

    await PermissoesController.obterMeuPerfil(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Permissões do usuário autenticado obtidas com sucesso',
      data: expect.objectContaining({
        effective_permissions: ['usuarios.acesso'],
        roles: ['modulo:organizacao'],
      }),
    }));
  });

  test('obterCatalogo retorna catálogo agrupado', async () => {
    jest.spyOn(PermissoesService, 'obterCatalogo').mockReturnValue({ modules: [{ key: 'organizacao' }], permissions: [], plans: [] } as any);
    const req = criarRequestMock();
    const res = criarResponseMock();

    await PermissoesController.obterCatalogo(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Catálogo de permissões obtido com sucesso',
      data: expect.objectContaining({ modules: [{ key: 'organizacao' }] }),
    }));
  });

  test('obterUsuario retorna snapshot de permissões do usuário', async () => {
    jest.spyOn(PermissoesService, 'obterPermissoesUsuarioParaGestao').mockResolvedValue({
      user: { id: 2 },
      overrides: [{ permission_key: 'estoque.acesso', effect: 'deny' }],
      effective_permissions: [],
      permissions: [],
      access: {},
      roles: ['modulo:estoque'],
      module_roles: ['modulo:estoque'],
    } as any);
    const req = criarRequestMock({ user: { tenant_id: 1 }, params: { id: '2' } });
    const res = criarResponseMock();

    await PermissoesController.obterUsuario(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Permissões do usuário obtidas com sucesso',
      data: expect.objectContaining({
        overrides: [{ permission_key: 'estoque.acesso', effect: 'deny' }],
      }),
    }));
  });

  test('substituirSubstituicoesUsuario substitui overrides', async () => {
    jest.spyOn(PermissoesService, 'substituirSubstituicoesUsuario').mockResolvedValue({
      overrides: [{ permission_key: 'estoque.acesso', effect: 'allow' }],
      effective_permissions: ['estoque.acesso'],
    } as any);
    const req = criarRequestMock({
      user: { tenant_id: 1 },
      params: { id: '2' },
      body: { overrides: [{ permission_key: 'estoque.acesso', effect: 'allow' }] },
    });
    const res = criarResponseMock();

    await PermissoesController.substituirSubstituicoesUsuario(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Permissões do usuário atualizadas com sucesso',
      data: expect.objectContaining({
        effective_permissions: ['estoque.acesso'],
      }),
    }));
  });
});
