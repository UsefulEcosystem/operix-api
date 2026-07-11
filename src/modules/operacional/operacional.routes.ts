import { Router } from "express";
import ValidacaoMiddleware from "../../core/middlewares/validacao.middleware.js";
import PermissoesMiddleware from "../../core/middlewares/permissoes.middleware.js";

import ServicosController from "./servicos/servicos.controller.js";
import {
  serviceCreateSchema,
  serviceUpdateInfoClientSchema,
} from "./servicos/servicos.schema.js";

import OrdemServicoController from "./ordem-servico/ordem-servico.controller.js";
import { orderUpdateEstimateSchema } from "./ordem-servico/ordem-servico.schema.js";

const router = Router();

// --- Services ---
router.get(
  "/servicos",
  PermissoesMiddleware.exigirPermissao("operational.services.access"),
  ServicosController.obterTodos,
);
router.post(
  "/servicos",
  PermissoesMiddleware.exigirPermissao("operational.services.access"),
  ValidacaoMiddleware.validarSchema(serviceCreateSchema),
  ServicosController.criar,
);

router.put(
  "/servicos/info/cliente/:id",
  PermissoesMiddleware.exigirPermissao("operational.services.access"),
  ValidacaoMiddleware.validarSchema(serviceUpdateInfoClientSchema),
  ServicosController.atualizarInfoCliente,
);
router.put(
  "/servicos/status/:id",
  PermissoesMiddleware.exigirPermissao("operational.services.access"),
  ServicosController.atualizarStatusServico,
);
router.put(
  "/servicos/status/pagamento/:id",
  PermissoesMiddleware.exigirPermissao("operational.services.access"),
  ServicosController.atualizarStatusPagamento,
);
router.delete(
  "/servicos/:id/:cod",
  PermissoesMiddleware.exigirPermissao("operational.services.access"),
  ServicosController.remover,
);

// --- Order of Service ---
router.get(
  "/ordem-servico",
  PermissoesMiddleware.exigirPermissao("operational.services.access"),
  OrdemServicoController.obterTodos,
);
router.get(
  "/ordem-servico/:cod",
  PermissoesMiddleware.exigirPermissao("operational.services.access"),
  OrdemServicoController.obterUnico,
);
router.put(
  "/ordem-servico/orcamento/:cod",
  PermissoesMiddleware.exigirPermissao("operational.services.access"),
  ValidacaoMiddleware.validarSchema(orderUpdateEstimateSchema),
  OrdemServicoController.atualizarOrcamento,
);
router.delete(
  "/ordem-servico/orcamento/:cod/:idEstimate",
  PermissoesMiddleware.exigirPermissao("operational.services.access"),
  OrdemServicoController.removerOrcamento,
);

export default router;
