import type { NextFunction, Request, Response } from 'express';
import ManipuladorResposta from '../utils/manipulador-resposta.js';
import AutenticacaoService from '../autenticacao/autenticacao.service.js';

export default class AutenticacaoMiddleware {
  private static normalizeAuthErrorMessage(error: unknown) {
    const rawMessage = error instanceof Error ? error.message : String(error || '');
    const normalized = rawMessage.toLowerCase();

    if (normalized.includes('jwt expired') || normalized.includes('token expired')) {
      return 'Token expirado';
    }

    if (normalized.includes('jwt not active')) {
      return 'Token ainda não está ativo';
    }

    if (normalized.includes('revogado')) {
      return 'Token revogado';
    }

    return rawMessage || 'Falha na autenticação';
  }

  static async verificarTokenBruto(token: string): Promise<any> {
    return AutenticacaoService.verificarAccessToken(token);
  }

  static async autenticarToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!token) {
      return ManipuladorResposta.erro(res, 'Token de acesso não fornecido', 401);
    }

    try {
      (req as any).user = await AutenticacaoMiddleware.verificarTokenBruto(token);
      next();
    } catch (error: any) {
      return ManipuladorResposta.erro(res, AutenticacaoMiddleware.normalizeAuthErrorMessage(error), 401);
    }
  }
}
