import type { NextFunction, Request, Response } from 'express';
import ManipuladorResposta from '../utils/manipulador-resposta.js';

type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
let lastCleanupAt = 0;

function getClientIp(req: Request) {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function cleanupExpiredBuckets(now: number) {
  if (now - lastCleanupAt < 60_000) {
    return;
  }

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }

  lastCleanupAt = now;
}

export default class RateLimitMiddleware {
  static criar(options: RateLimitOptions) {
    return (req: Request, res: Response, next: NextFunction) => {
      const now = Date.now();
      cleanupExpiredBuckets(now);

      const key = `${options.keyPrefix}:${getClientIp(req)}`;
      const current = buckets.get(key);
      const bucket = current && current.resetAt > now
        ? current
        : { count: 0, resetAt: now + options.windowMs };

      bucket.count += 1;
      buckets.set(key, bucket);

      const remaining = Math.max(options.maxRequests - bucket.count, 0);
      res.setHeader('X-RateLimit-Limit', String(options.maxRequests));
      res.setHeader('X-RateLimit-Remaining', String(remaining));
      res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

      if (bucket.count > options.maxRequests) {
        const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
        res.setHeader('Retry-After', String(retryAfter));
        return ManipuladorResposta.erro(res, 'Muitas tentativas. Tente novamente mais tarde.', 429);
      }

      return next();
    };
  }

  static authEstrito = RateLimitMiddleware.criar({
    windowMs: 15 * 60_000,
    maxRequests: 20,
    keyPrefix: 'auth:strict',
  });

  static authPadrao = RateLimitMiddleware.criar({
    windowMs: 15 * 60_000,
    maxRequests: 60,
    keyPrefix: 'auth:standard',
  });

  static cadastroPublico = RateLimitMiddleware.criar({
    windowMs: 60 * 60_000,
    maxRequests: 10,
    keyPrefix: 'auth:onboarding',
  });
}
