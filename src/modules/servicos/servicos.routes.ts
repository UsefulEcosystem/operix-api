import { Router } from 'express';
import PermissoesMiddleware from '../../core/middlewares/permissoes.middleware.js';
import ValidacaoMiddleware from '../../core/middlewares/validacao.middleware.js';
import ServicosController from './servicos.controller.js';
import {
  serviceCreateSchema,
  servicePaymentStatusUpdateSchema,
  serviceStatusUpdateSchema,
  serviceUpdateInfoClientSchema,
} from './servicos.schema.js';

const router = Router();

router.get('/servicos/painel-externo', PermissoesMiddleware.exigirPermissao('servicos.acesso'), ServicosController.listarPainelExterno);
router.get('/servicos/painel-externo/:cod', PermissoesMiddleware.exigirPermissao('servicos.acesso'), ServicosController.obterPainelExterno);
router.get('/servicos', PermissoesMiddleware.exigirPermissao('servicos.acesso'), ServicosController.obterTodos);
router.post(
  '/servicos',
  PermissoesMiddleware.exigirPermissao('servicos.acesso'),
  ValidacaoMiddleware.validarSchema(serviceCreateSchema),
  ServicosController.criar,
);
router.put(
  '/servicos/info/cliente/:id',
  PermissoesMiddleware.exigirPermissao('servicos.acesso'),
  ValidacaoMiddleware.validarSchema(serviceUpdateInfoClientSchema),
  ServicosController.atualizarInfoCliente,
);
router.put(
  '/servicos/status/:id',
  PermissoesMiddleware.exigirPermissao('servicos.acesso'),
  ValidacaoMiddleware.validarSchema(serviceStatusUpdateSchema),
  ServicosController.atualizarStatusServico,
);
router.put(
  '/servicos/status/pagamento/:id',
  PermissoesMiddleware.exigirPermissao('servicos.acesso'),
  ValidacaoMiddleware.validarSchema(servicePaymentStatusUpdateSchema),
  ServicosController.atualizarStatusPagamento,
);
router.delete(
  '/servicos/:id/:cod',
  PermissoesMiddleware.exigirPermissao('servicos.acesso'),
  ServicosController.remover,
);

export default router;
