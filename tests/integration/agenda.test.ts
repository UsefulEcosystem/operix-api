import AgendaController from '../../src/modules/agenda/agenda.controller.js';
import AgendaService from '../../src/modules/agenda/agenda.service.js';
import { criarRequestMock, criarResponseMock } from '../support/mocks-express.js';

describe('Agenda e lembretes', () => {
  afterEach(() => jest.restoreAllMocks());

  test('cria lembrete sem vínculo', async () => {
    jest.spyOn(AgendaService, 'criar').mockResolvedValue({ id: 1, title: 'Ligar para cliente' } as any);
    const req = criarRequestMock({ user: { id: 4, tenant_id: 2, permissions: ['painel.acesso'] }, body: { title: 'Ligar para cliente', starts_at: '2026-08-09T12:00:00.000Z' } });
    const res = criarResponseMock();
    await AgendaController.criar(req, res);
    expect(AgendaService.criar).toHaveBeenCalledWith(2, 4, req.body);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('bloqueia vínculo com serviço sem permissão do módulo', async () => {
    const req = criarRequestMock({ user: { id: 4, tenant_id: 2, permissions: ['painel.acesso'] }, body: { title: 'Retorno', starts_at: '2026-08-09T12:00:00.000Z', service_id: 10 } });
    const res = criarResponseMock();
    await expect(AgendaController.criar(req, res)).rejects.toThrow('acesso ao módulo de serviços');
  });

  test('lista agenda sem expor vínculo de venda quando não há permissão', async () => {
    jest.spyOn(AgendaService, 'listar').mockResolvedValue([{ id: 1, title: 'Venda', sale_id: 8, sale_customer_name: 'Cliente' }] as any);
    const req = criarRequestMock({ user: { tenant_id: 2, permissions: ['painel.acesso'] }, query: {} });
    const res = criarResponseMock();
    await AgendaController.listar(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: [expect.objectContaining({ id: 1, title: 'Venda', sale_id: null, sale_customer_name: null })] }));
  });
});
