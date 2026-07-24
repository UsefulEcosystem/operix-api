import { Router } from 'express';
import PermissoesMiddleware from '../../core/middlewares/permissoes.middleware.js';
import NotificacoesController from './notificacoes.controller.js';

const router = Router();

router.get(
  '/notificacoes',
  PermissoesMiddleware.exigirPermissao('notificacoes.acesso'),
  NotificacoesController.listar,
);

export default router;
