import NotificacoesController from '../../src/modules/notificacoes/notificacoes.controller.js';
import NotificacoesService from '../../src/modules/notificacoes/notificacoes.service.js';
import { criarRequestMock, criarResponseMock } from '../support/mocks-express.js';

describe('Testes de Integração - Rotas de Notificações', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('listar retorna payload do serviço', async () => {
    jest.spyOn(NotificacoesService, 'listar').mockResolvedValue([{ id: 1, title: 'Serviço antigo' } as any]);
    const req = criarRequestMock({ user: { tenant_id: 1 } });
    const res = criarResponseMock();

    await NotificacoesController.listar(req, res);

    expect(NotificacoesService.listar).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Notificações listadas com sucesso',
      data: [{ id: 1, title: 'Serviço antigo' }],
    }));
  });
});
