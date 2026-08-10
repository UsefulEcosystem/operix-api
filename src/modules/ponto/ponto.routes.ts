import { Router } from 'express';
import PermissoesMiddleware from '../../core/middlewares/permissoes.middleware.js';
import ValidacaoMiddleware from '../../core/middlewares/validacao.middleware.js';
import PontoController from './ponto.controller.js';
import { adjustmentSchema, reviewSchema, timeEntryCloseSchema } from './ponto.schema.js';
const router=Router(); const service=PermissoesMiddleware.exigirPermissao('servicos.acesso');
router.get('/ponto/me',service,PontoController.atual); router.get('/ponto/me/historico',service,PontoController.historico); router.post('/ponto/iniciar',service,PontoController.iniciar); router.post('/ponto/encerrar',service,ValidacaoMiddleware.validarSchema(timeEntryCloseSchema),PontoController.encerrar); router.post('/ponto/:id/solicitar-ajuste',service,ValidacaoMiddleware.validarSchema(adjustmentSchema),PontoController.solicitar);
const manager=PermissoesMiddleware.exigirPermissao('ponto.acesso'); router.get('/ponto/gerenciar',manager,PontoController.gerenciar); router.get('/ponto/ajustes',manager,PontoController.ajustes); router.patch('/ponto/ajustes/:id',manager,ValidacaoMiddleware.validarSchema(reviewSchema),PontoController.revisar);
export default router;
