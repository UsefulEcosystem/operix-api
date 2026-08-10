import { Router } from 'express';
import AcessoExternoController from './acesso-externo.controller.js';
import PermissoesMiddleware from '../../core/middlewares/permissoes.middleware.js';
const router = Router();
router.get('/perfil/acesso-externo', PermissoesMiddleware.exigirPermissao('servicos.acesso'), AcessoExternoController.meuLink);
router.post('/perfil/acesso-externo/rotacionar', PermissoesMiddleware.exigirPermissao('servicos.acesso'), AcessoExternoController.rotacionarMeuLink);
router.post('/usuarios/:id/acesso-externo', PermissoesMiddleware.exigirPermissao('usuarios.acesso'), PermissoesMiddleware.exigirAdmin(), AcessoExternoController.criarLink);
export default router;
