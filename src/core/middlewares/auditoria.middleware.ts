import type { Request, Response, NextFunction } from 'express';
import AuditService from '../logs/audit.service.js';

const mutatingMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function moduleFromPath(path: string) {
  const segment = path.replace(/^\/api\/?/, '').replace(/^\//, '').split('/')[0];
  return segment || 'core';
}

function sanitizePayload(value: any): any {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(sanitizePayload);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => (
    /password|token|secret|authorization/i.test(key) ? [key, '[REDACTED]'] : [key, sanitizePayload(item)]
  )));
}

export default class AuditoriaMiddleware {
  static handle(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
      const user = (req as any).user;
      if (!user?.id || !user?.tenant_id || !mutatingMethods.has(req.method) || req.originalUrl.includes('/logs')) return;

      AuditService.registrar({
        module: moduleFromPath(req.path),
        operation: `${req.method} ${req.path}`,
        user_id: user.id,
        tenant_id: user.tenant_id,
        json_dados: {
          status: res.statusCode,
          body: sanitizePayload(req.body || {}),
          params: sanitizePayload(req.params || {}),
          query: sanitizePayload(req.query || {}),
        },
      });
    });
    next();
  }
}
