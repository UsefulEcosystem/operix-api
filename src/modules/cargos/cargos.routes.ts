import { Router } from 'express';
import PermissoesMiddleware from '../../core/middlewares/permissoes.middleware.js';
import ValidacaoMiddleware from '../../core/middlewares/validacao.middleware.js';
import CargosController from './cargos.controller.js';
import { cargoCreateSchema, cargoUpdateSchema } from './cargos.schema.js';

const router = Router();
const access = PermissoesMiddleware.exigirPermissao('cargos.acesso');
router.get('/cargos', access, CargosController.listar);
router.post('/cargos', access, ValidacaoMiddleware.validarSchema(cargoCreateSchema), CargosController.criar);
router.put('/cargos/:id', access, ValidacaoMiddleware.validarSchema(cargoUpdateSchema), CargosController.atualizar);
router.delete('/cargos/:id', access, CargosController.remover);
export default router;
