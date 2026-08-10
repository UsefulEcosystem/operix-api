import AuditoriaMiddleware from '../../src/core/middlewares/auditoria.middleware.js';
import AuditService from '../../src/core/logs/audit.service.js';

describe('AuditoriaMiddleware', () => {
  afterEach(() => jest.restoreAllMocks());

  test('registra ações mutáveis autenticadas com módulo, operação e contexto', () => {
    const registrar = jest.spyOn(AuditService, 'registrar').mockImplementation(() => undefined);
    const finishHandlers: Function[] = [];
    const req: any = { method: 'POST', path: '/cargos', originalUrl: '/api/cargos', body: { name: 'Supervisor' }, params: {}, query: {}, user: { id: 7, tenant_id: 3 } };
    const res: any = { statusCode: 201, on: (_event: string, handler: Function) => finishHandlers.push(handler) };
    const next = jest.fn();
    AuditoriaMiddleware.handle(req, res, next);
    expect(next).toHaveBeenCalled();
    finishHandlers[0]();
    expect(registrar).toHaveBeenCalledWith(expect.objectContaining({ module: 'cargos', operation: 'POST /cargos', user_id: 7, tenant_id: 3 }));
  });

  test('não registra leitura', () => {
    const registrar = jest.spyOn(AuditService, 'registrar').mockImplementation(() => undefined);
    const handlers: Function[] = [];
    AuditoriaMiddleware.handle({ method: 'GET', path: '/cargos', originalUrl: '/api/cargos', user: { id: 1, tenant_id: 2 } } as any, { on: (_: string, h: Function) => handlers.push(h), statusCode: 200 } as any, jest.fn());
    handlers[0]();
    expect(registrar).not.toHaveBeenCalled();
  });
});
