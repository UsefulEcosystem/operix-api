import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import ManipuladorResposta from '../utils/manipulador-resposta.js';

export default class SegurancaMiddleware {
  static handle(req: Request, res: Response, next: NextFunction) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');

    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    next();
  }

  static exigirOrigemConfiavel(req: Request, res: Response, next: NextFunction) {
    const originHeader = req.headers.origin || req.headers.referer;
    if (!originHeader) {
      next();
      return;
    }

    const origin = Array.isArray(originHeader) ? originHeader[0] : originHeader;
    if (!origin) {
      next();
      return;
    }

    try {
      const requestOrigin = new URL(origin).origin;
      if (env.origins.includes(requestOrigin)) {
        next();
        return;
      }
    } catch {
      return ManipuladorResposta.erro(res, 'Origem da requisição inválida.', 403);
    }

    return ManipuladorResposta.erro(res, 'Origem da requisição não autorizada.', 403);
  }
}
