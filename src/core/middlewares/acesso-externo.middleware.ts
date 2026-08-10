import type { NextFunction, Request, Response } from 'express';
import ManipuladorResposta from '../utils/manipulador-resposta.js';

export default function limitarAcessoExterno(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).user?.external) return next();
  const path = req.path;
  const allowed = path.startsWith('/servicos/painel-externo')
    || path.startsWith('/ordens-servico/')
    || path === '/ponto/me'
    || path === '/ponto/me/historico'
    || path === '/ponto/iniciar'
    || path === '/ponto/encerrar'
    || /^\/ponto\/\d+\/solicitar-ajuste$/.test(path);
  if (!allowed) return ManipuladorResposta.erro(res, 'Sessão externa limitada ao painel de serviços e ponto.', 403);
  return next();
}
