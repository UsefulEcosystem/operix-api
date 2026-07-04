import type { Request, Response, NextFunction } from 'express';
import ManipuladorResposta from '../utils/manipulador-resposta.js';

export default class TratadorErroGlobal {
  static handle(err: any, req: Request, res: Response, next: NextFunction) {
    void next;
    console.error(`[Global Error Handler]: ${err.stack || err.message}`);
    const status = err.status || 500;
    const message = err.message || 'Ocorreu um erro interno no servidor.';
    return ManipuladorResposta.erro(res, message, status);
  }
}
