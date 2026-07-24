import StatusPagamentoController from '../../src/modules/status-pagamento/status-pagamento.controller.js';
import StatusPagamentoService from '../../src/modules/status-pagamento/status-pagamento.service.js';
import StatusServicoController from '../../src/modules/status-servico/status-servico.controller.js';
import StatusServicoService from '../../src/modules/status-servico/status-servico.service.js';
import TiposProdutoController from '../../src/modules/tipos-produto/tipos-produto.controller.js';
import TiposProdutoService from '../../src/modules/tipos-produto/tipos-produto.service.js';
import { criarRequestMock, criarResponseMock } from '../support/mocks-express.js';

describe('Testes de Integração - Rotas de Parâmetros (Status e Tipos)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('status payment lista e cria registros', async () => {
    jest.spyOn(StatusPagamentoService, 'obterTodos').mockResolvedValue([{ id: 1 } as any]);
    jest.spyOn(StatusPagamentoService, 'criar').mockResolvedValue({ id: 2 } as any);

    const listReq = criarRequestMock({ user: { tenant_id: 1 } });
    const listRes = criarResponseMock();
    await StatusPagamentoController.obterTodos(listReq, listRes);

    const createReq = criarRequestMock({ user: { tenant_id: 1 }, body: { description: 'Paid' } });
    const createRes = criarResponseMock();
    await StatusPagamentoController.criar(createReq, createRes);

    expect(listRes.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Status de pagamento listados com sucesso' }));
    expect(createRes.status).toHaveBeenCalledWith(201);
  });

  test('status service lista e cria registros', async () => {
    jest.spyOn(StatusServicoService, 'obterTodos').mockResolvedValue([{ id: 1 } as any]);
    jest.spyOn(StatusServicoService, 'criar').mockResolvedValue({ id: 2 } as any);

    const listReq = criarRequestMock({ user: { tenant_id: 1 } });
    const listRes = criarResponseMock();
    await StatusServicoController.obterTodos(listReq, listRes);

    const createReq = criarRequestMock({ user: { tenant_id: 1 }, body: { description: 'Done' } });
    const createRes = criarResponseMock();
    await StatusServicoController.criar(createReq, createRes);

    expect(listRes.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Status de serviço listados com sucesso' }));
    expect(createRes.status).toHaveBeenCalledWith(201);
  });

  test('types product lista e cria registros', async () => {
    jest.spyOn(TiposProdutoService, 'obterTodos').mockResolvedValue([{ id: 1 } as any]);
    jest.spyOn(TiposProdutoService, 'criar').mockResolvedValue({ id: 2 } as any);

    const listReq = criarRequestMock({ user: { tenant_id: 1 } });
    const listRes = criarResponseMock();
    await TiposProdutoController.obterTodos(listReq, listRes);

    const createReq = criarRequestMock({ user: { tenant_id: 1 }, body: { name: 'Grocery' } });
    const createRes = criarResponseMock();
    await TiposProdutoController.criar(createReq, createRes);

    expect(listRes.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Tipos de produto listados com sucesso' }));
    expect(createRes.status).toHaveBeenCalledWith(201);
  });
});
