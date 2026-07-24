import UsuariosController from '../../src/modules/usuarios/usuarios.controller.js';
import UsuariosService from '../../src/modules/usuarios/usuarios.service.js';
import { criarRequestMock, criarResponseMock } from '../support/mocks-express.js';

describe('Testes de Integração - Rotas de Usuários', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('obterTodos lista usuários do tenant autenticado', async () => {
    jest.spyOn(UsuariosService, 'obterTodos').mockResolvedValue([{ id: 1, username: 'admin' } as any]);
    const req = criarRequestMock({ user: { tenant_id: 1 } });
    const res = criarResponseMock();

    await UsuariosController.obterTodos(req, res);

    expect(UsuariosService.obterTodos).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      msg: 'Usuários listados com sucesso',
      data: [{ id: 1, username: 'admin' }],
    }));
  });

  test('create cria usuário no tenant autenticado', async () => {
    jest.spyOn(UsuariosService, 'criar').mockResolvedValue({ id: 22, username: 'maria', tenant_id: 1 } as any);
    const req = criarRequestMock({
      user: { tenant_id: 1 },
      body: {
        name: 'Maria',
        username: 'maria',
        password: '12345678',
        modules: ['estoque'],
      },
    });
    const res = criarResponseMock();

    await UsuariosController.criar(req, res);

    expect(UsuariosService.criar).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      msg: 'Usuário criado com sucesso',
      data: { id: 22, username: 'maria', tenant_id: 1 },
    }));
  });

  test('remove responde 204 quando o serviço conclui remoção', async () => {
    jest.spyOn(UsuariosService, 'remover').mockResolvedValue(true as never);
    const req = criarRequestMock({ user: { tenant_id: 1 }, params: { id: '2' } });
    const res = criarResponseMock();

    await UsuariosController.remover(req, res);

    expect(UsuariosService.remover).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });

  test('atualizarAcesso atualiza acesso do usuário', async () => {
    jest.spyOn(UsuariosService, 'atualizarAcesso').mockResolvedValue({ id: 2, active: false } as any);
    const req = criarRequestMock({
      user: { id: 1, tenant_id: 1, root: true },
      params: { id: '2' },
      body: { active: false },
    });
    const res = criarResponseMock();

    await UsuariosController.atualizarAcesso(req, res);

    expect(UsuariosService.atualizarAcesso).toHaveBeenCalledWith(2, req.user, expect.anything());
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      msg: 'Usuário atualizado com sucesso',
      data: { id: 2, active: false },
    }));
  });
});
