import LocatariosController from '../../src/modules/locatarios/locatarios.controller.js';
import LocatariosService from '../../src/modules/locatarios/locatarios.service.js';
import { criarRequestMock, criarResponseMock } from '../support/mocks-express.js';

describe('Testes de Integração - Rotas de Tenants', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('obterTodos retorna tenants cadastrados', async () => {
    jest.spyOn(LocatariosService, 'obterTodos').mockResolvedValue([{ id: 1, name: 'Tenant A' } as any]);
    const req = criarRequestMock();
    const res = criarResponseMock();

    await LocatariosController.obterTodos(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      msg: 'Unidades listadas com sucesso',
      data: [{ id: 1, name: 'Tenant A' }],
    }));
  });

  test('create cria tenant', async () => {
    jest.spyOn(LocatariosService, 'criar').mockResolvedValue({ id: 10, name: 'Novo Tenant' } as any);
    const req = criarRequestMock({ body: { name: 'Novo Tenant' } });
    const res = criarResponseMock();

    await LocatariosController.criar(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      msg: 'Unidade criada com sucesso',
      data: { id: 10, name: 'Novo Tenant' },
    }));
  });

  test('remove encerra com 204', async () => {
    jest.spyOn(LocatariosService, 'remover').mockResolvedValue(true as never);
    const req = criarRequestMock({ params: { id: '1' } });
    const res = criarResponseMock();

    await LocatariosController.remover(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });
});
