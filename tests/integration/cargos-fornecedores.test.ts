import CargosController from '../../src/modules/cargos/cargos.controller.js';
import CargosService from '../../src/modules/cargos/cargos.service.js';
import FornecedoresController from '../../src/modules/fornecedores/fornecedores.controller.js';
import FornecedoresService from '../../src/modules/fornecedores/fornecedores.service.js';
import { criarRequestMock, criarResponseMock } from '../support/mocks-express.js';

describe('Cargos e fornecedores', () => {
  afterEach(() => jest.restoreAllMocks());

  test('lista cargos globais e personalizados do tenant', async () => {
    jest.spyOn(CargosService, 'listar').mockResolvedValue([
      { id: 1, name: 'Proprietário', is_system: true },
      { id: 8, name: 'Supervisor', is_system: false, tenant_id: 3 },
    ] as any);
    const req = criarRequestMock({ user: { tenant_id: 3 } });
    const res = criarResponseMock();
    await CargosController.listar(req, res);
    expect(CargosService.listar).toHaveBeenCalledWith(3);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: expect.arrayContaining([expect.objectContaining({ name: 'Proprietário', is_system: true })]) }));
  });

  test('não permite remover cargo padrão', async () => {
    jest.spyOn(CargosService, 'remover').mockRejectedValue(new Error('Cargo não encontrado ou protegido.'));
    await expect(CargosService.remover(1, 3)).rejects.toThrow('protegido');
  });

  test('cria, atualiza e remove fornecedor', async () => {
    jest.spyOn(FornecedoresService, 'criar').mockResolvedValue({ id: 4, name: 'ACME' } as any);
    jest.spyOn(FornecedoresService, 'atualizar').mockResolvedValue({ id: 4, name: 'ACME Atualizada' } as any);
    jest.spyOn(FornecedoresService, 'remover').mockResolvedValue({ id: 4 } as any);
    const user = { tenant_id: 3 };
    const createRes = criarResponseMock();
    await FornecedoresController.criar(criarRequestMock({ user, body: { name: 'ACME' } }), createRes);
    expect(createRes.status).toHaveBeenCalledWith(201);
    const updateRes = criarResponseMock();
    await FornecedoresController.atualizar(criarRequestMock({ user, params: { id: '4' }, body: { name: 'ACME Atualizada' } }), updateRes);
    expect(FornecedoresService.atualizar).toHaveBeenCalledWith(4, 3, { name: 'ACME Atualizada' });
    const deleteRes = criarResponseMock();
    await FornecedoresController.remover(criarRequestMock({ user, params: { id: '4' } }), deleteRes);
    expect(deleteRes.status).toHaveBeenCalledWith(204);
  });
});
