import ConfiguracoesPerfilController from '../../src/modules/perfil/configuracoes-perfil.controller.js';
import PermissoesService from '../../src/core/permissoes/permissoes.service.js';
import LocatarioRepository from '../../src/modules/locatarios/locatarios.repository.js';
import LocatariosService from '../../src/modules/locatarios/locatarios.service.js';
import UsuariosService from '../../src/modules/usuarios/usuarios.service.js';
import { criarRequestMock, criarResponseMock } from '../support/mocks-express.js';

describe('Testes de Integração - Rotas de Perfil', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('obterMeuPerfil retorna perfil sanitizado', async () => {
    const req = criarRequestMock({ user: { id: 7, sub: 'kc-owner', username: 'owner', tenant_id: 3 } });
    const res = criarResponseMock();

    await ConfiguracoesPerfilController.obterMeuPerfil(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Perfil carregado com sucesso',
      data: expect.objectContaining({ sub: 'kc-owner', username: 'owner' }),
    }));
  });

  test('updateMe atualiza perfil do usuário', async () => {
    jest.spyOn(UsuariosService, 'atualizarPerfilProprio').mockResolvedValue({ id: 7, role_title: 'Diretor' } as any);
    const req = criarRequestMock({ user: { id: 7, tenant_id: 3 }, body: { role_title: 'Diretor' } });
    const res = criarResponseMock();

    await ConfiguracoesPerfilController.atualizarMeuPerfil(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Perfil atualizado com sucesso',
      data: { id: 7, role_title: 'Diretor' },
    }));
  });

  test('obterEmpresa retorna empresa do tenant', async () => {
    jest.spyOn(LocatarioRepository, 'findById').mockResolvedValue({ id: 3, name: 'Opeflow' } as any);
    const req = criarRequestMock({ user: { tenant_id: 3 } });
    const res = criarResponseMock();

    await ConfiguracoesPerfilController.obterEmpresa(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Empresa carregada com sucesso',
      data: { id: 3, name: 'Opeflow' },
    }));
  });

  test('atualizarEmpresa atualiza empresa atual', async () => {
    jest.spyOn(LocatariosService, 'atualizar').mockResolvedValue({ id: 3, name: 'Opeflow Updated' } as any);
    const req = criarRequestMock({ user: { tenant_id: 3 }, body: { name: 'Opeflow Updated' } });
    const res = criarResponseMock();

    await ConfiguracoesPerfilController.atualizarEmpresa(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Empresa atualizada com sucesso',
      data: { id: 3, name: 'Opeflow Updated' },
    }));
  });

  test('obterSistema retorna catálogo e permissões efetivas', async () => {
    jest.spyOn(PermissoesService, 'obterPermissoesUsuarioAtual').mockResolvedValue({
      access: { plan: 'trial' },
      effective_permissions: ['configuracoes.acesso'],
      permissions: [],
    } as any);
    jest.spyOn(PermissoesService, 'obterCatalogo').mockReturnValue({ modules: [], permissions: [], plans: [] } as any);
    const req = criarRequestMock({ user: { tenant_id: 3 } });
    const res = criarResponseMock();

    await ConfiguracoesPerfilController.obterSistema(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Configurações do sistema carregadas com sucesso',
      data: expect.objectContaining({
        effective_permissions: ['configuracoes.acesso'],
        catalog: { modules: [], permissions: [], plans: [] },
      }),
    }));
  });
});
