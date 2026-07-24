import type { Request, Response, NextFunction } from 'express';
import LogsService from '../logs/logs.service.js';

export default class LogMiddleware {
  static handle(req: Request, res: Response, next: NextFunction) {
    res.locals.startTime = Date.now();

    res.on('finish', () => {
      if (req.originalUrl && req.originalUrl.includes('/logs')) return;

      const executionTime = Date.now() - res.locals.startTime;
      const user = (req as any).user;

      const payload = {
        tenant_id: user?.tenant_id || null,
        user_id: user?.id || null,
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        response_time_ms: executionTime,
        message: res.locals.errorMessage || res.statusMessage || null,
      };

      LogsService.inserirLog(payload);
    });

    next();
  }
}
