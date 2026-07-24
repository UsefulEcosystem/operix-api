import ServicosController from '../../src/modules/servicos/servicos.controller.js';
import ServicosService from '../../src/modules/servicos/servicos.service.js';
import MensageriaService from '../../src/core/utils/mensageria.service.js';
import { criarRequestMock, criarResponseMock } from '../support/mocks-express.js';

describe('Testes de Integração - Rotas de Serviços (Services)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('obterTodos lista serviços', async () => {
    jest.spyOn(ServicosService, 'obterTodos').mockResolvedValue([{ id: 1, product: 'Repair' } as any]);
    const req = criarRequestMock({ user: { tenant_id: 1 } });
    const res = criarResponseMock();

    await ServicosController.obterTodos(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Serviços listados com sucesso' }));
  });

  test('create cria serviço e notifica tenant', async () => {
    jest.spyOn(ServicosService, 'criar').mockResolvedValue({ id: 11 } as any);
    const notifySpy = jest.spyOn(MensageriaService, 'notificarLocatario').mockImplementation(() => undefined);
    const req = criarRequestMock({ user: { tenant_id: 1 }, body: { product: 'Maintenance', client: 'John' } });
    const res = criarResponseMock();

    await ServicosController.criar(req, res);

    expect(notifySpy).toHaveBeenCalledWith(1, '@service/created', { id: 11 });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('atualizarInfoCliente atualiza dados do cliente', async () => {
    jest.spyOn(ServicosService, 'atualizarInfoCliente').mockResolvedValue({ id: 1 } as any);
    const req = criarRequestMock({ user: { tenant_id: 1 }, params: { id: '1' }, body: { client: 'John Doe' } });
    const res = criarResponseMock();

    await ServicosController.atualizarInfoCliente(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Informações do cliente atualizadas com sucesso' }));
  });

  test('remove retorna 204', async () => {
    jest.spyOn(ServicosService, 'remover').mockResolvedValue(true as never);
    const req = criarRequestMock({ user: { tenant_id: 1 }, params: { id: '1', cod: 'OS123', typeTable: 'OS' } });
    const res = criarResponseMock();

    await ServicosController.remover(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });
});
