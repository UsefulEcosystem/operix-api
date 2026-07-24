import OrdemServicoController from '../../src/modules/ordens-servico/ordem-servico.controller.js';
import OrdemServicoService from '../../src/modules/ordens-servico/ordem-servico.service.js';
import Utilitarios from '../../src/core/utils/utilitarios.js';
import { criarRequestMock, criarResponseMock } from '../support/mocks-express.js';

describe('Testes de Integração - Rotas de Ordem de Serviço (Order of Service)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('obterTodos lista ordens', async () => {
    jest.spyOn(OrdemServicoService, 'obterTodos').mockResolvedValue([{ id: 1, cod: 'OS123' } as any]);
    const req = criarRequestMock({ user: { tenant_id: 1 } });
    const res = criarResponseMock();

    await OrdemServicoController.obterTodos(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Ordens de serviço listadas com sucesso' }));
  });

  test('obterUnico retorna detalhe da ordem', async () => {
    jest.spyOn(OrdemServicoService, 'obterUnico').mockResolvedValue([{ id: 1, cod: 'OS123' }] as any);
    const req = criarRequestMock({ user: { tenant_id: 1 }, params: { cod: 'OS123' } });
    const res = criarResponseMock();

    await OrdemServicoController.obterUnico(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Ordem de serviço detalhada com sucesso' }));
  });

  test('atualizarOrcamento completa orçamento', async () => {
    jest.spyOn(OrdemServicoService, 'obterUnico').mockResolvedValue([{ estimate: '[]' }] as any);
    jest.spyOn(OrdemServicoService, 'atualizarOrcamento').mockResolvedValue({ ok: true } as any);
    jest.spyOn(Utilitarios, 'gerarUuid').mockReturnValue('uuid-1');
    const req = criarRequestMock({
      user: { tenant_id: 1 },
      params: { cod: 'OS123' },
      body: { type: 'completa', amount: 1, description: 'Item', price: 50 },
    });
    const res = criarResponseMock();

    await OrdemServicoController.atualizarOrcamento(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Orçamento atualizado com sucesso' }));
  });

  test('removerOrcamento retorna 204', async () => {
    jest.spyOn(OrdemServicoService, 'removerOrcamento').mockResolvedValue(true as never);
    const req = criarRequestMock({ user: { tenant_id: 1 }, params: { cod: 'OS123', idEstimate: '1' } });
    const res = criarResponseMock();

    await OrdemServicoController.removerOrcamento(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });
});
