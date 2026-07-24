import EstoqueController from '../../src/modules/estoque/estoque.controller.js';
import EstoqueService from '../../src/modules/estoque/estoque.service.js';
import MensageriaService from '../../src/core/utils/mensageria.service.js';
import { criarRequestMock, criarResponseMock } from '../support/mocks-express.js';

describe('Testes de Integração - Rotas de Estoque (Stock)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('obterTodos retorna itens do estoque', async () => {
    jest.spyOn(EstoqueService, 'obterTodos').mockResolvedValue([{ id: 1, name: 'Peça A' } as any]);
    const req = criarRequestMock({ user: { tenant_id: 1 } });
    const res = criarResponseMock();

    await EstoqueController.obterTodos(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Estoque listado com sucesso',
      data: [{ id: 1, name: 'Peça A' }],
    }));
  });

  test('create cria item de estoque', async () => {
    jest.spyOn(EstoqueService, 'criar').mockResolvedValue({ id: 2, name: 'Peça B' } as any);
    const req = criarRequestMock({ user: { tenant_id: 1 }, body: { name: 'Peça B', code: 'PB', quantity: 5 } });
    const res = criarResponseMock();

    await EstoqueController.criar(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      msg: 'Item de estoque criado com sucesso',
      data: { id: 2, name: 'Peça B' },
    }));
  });

  test('update dispara alerta de estoque baixo quando quantity <= 5', async () => {
    jest.spyOn(EstoqueService, 'atualizar').mockResolvedValue({ id: 1, quantity: 3 } as any);
    const notifySpy = jest.spyOn(MensageriaService, 'notificarLocatario').mockImplementation(() => undefined);
    const req = criarRequestMock({ user: { tenant_id: 1 }, params: { id: '1' }, body: { quantity: 3 } });
    const res = criarResponseMock();

    await EstoqueController.atualizar(req, res);

    expect(notifySpy).toHaveBeenCalledWith(1, '@stock/low_stock_alert', { id: 1, quantity: 3 });
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Item de estoque atualizado com sucesso' }));
  });

  test('remove retorna item removido', async () => {
    jest.spyOn(EstoqueService, 'remover').mockResolvedValue({ id: 1 } as any);
    const req = criarRequestMock({ user: { tenant_id: 1 }, params: { id: '1' } });
    const res = criarResponseMock();

    await EstoqueController.remover(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Item de estoque removido com sucesso' }));
  });
});
