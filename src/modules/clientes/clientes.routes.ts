import { Router } from 'express';
import PermissoesMiddleware from '../../core/middlewares/permissoes.middleware.js';
import ValidacaoMiddleware from '../../core/middlewares/validacao.middleware.js';
import ClientesController from './clientes.controller.js';
import { clientCreateSchema, clientUpdateSchema } from './clientes.schema.js';

const router = Router();
const permission = PermissoesMiddleware.exigirPermissao('clientes.acesso');

router.get('/clientes', permission, ClientesController.listar);
router.get('/clientes/:id', permission, ClientesController.obterPorId);
router.post('/clientes', permission, ValidacaoMiddleware.validarSchema(clientCreateSchema), ClientesController.criar);
router.put('/clientes/:id', permission, ValidacaoMiddleware.validarSchema(clientUpdateSchema), ClientesController.atualizar);
router.delete('/clientes/:id', permission, ClientesController.remover);

export default router;
