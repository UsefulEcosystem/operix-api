import { Router } from "express";
import ValidacaoMiddleware from "../../core/middlewares/validacao.middleware.ts";
import PermissoesMiddleware from "../../core/middlewares/permissoes.middleware.ts";

import StatusServicoController from "./status-servico/status-servico.controller.ts";
import { statusServiceCreateSchema } from "./status-servico/status-servico.schema.ts";

import StatusPagamentoController from "./status-pagamento/status-pagamento.controller.ts";
import { statusPaymentCreateSchema } from "./status-pagamento/status-pagamento.schema.ts";

import TiposProdutoController from "./tipos-produto/tipos-produto.controller.ts";
import { typeProductCreateSchema } from "./tipos-produto/tipos-produto.schema.ts";

const router = Router();

// --- Status Service ---
router.get(
  "/status-servico",
  PermissoesMiddleware.exigirPermissao("operational.status.access"),
  StatusServicoController.obterTodos,
);
router.post(
  "/status-servico",
  PermissoesMiddleware.exigirPermissao("operational.status.access"),
  ValidacaoMiddleware.validarSchema(statusServiceCreateSchema),
  StatusServicoController.criar,
);
router.delete(
  "/status-servico/:id",
  PermissoesMiddleware.exigirPermissao("operational.status.access"),
  StatusServicoController.remover,
);

// --- Status Payment ---
router.get(
  "/status-pagamento",
  PermissoesMiddleware.exigirPermissao("operational.status.access"),
  StatusPagamentoController.obterTodos,
);
router.post(
  "/status-pagamento",
  PermissoesMiddleware.exigirPermissao("operational.status.access"),
  ValidacaoMiddleware.validarSchema(statusPaymentCreateSchema),
  StatusPagamentoController.criar,
);
router.delete(
  "/status-pagamento/:id",
  PermissoesMiddleware.exigirPermissao("operational.status.access"),
  StatusPagamentoController.remover,
);

// --- Types Product ---
router.get(
  "/tipos-produto",
  PermissoesMiddleware.exigirPermissao("operational.types-products.access"),
  TiposProdutoController.obterTodos,
);
router.post(
  "/tipos-produto",
  PermissoesMiddleware.exigirPermissao("operational.types-products.access"),
  ValidacaoMiddleware.validarSchema(typeProductCreateSchema),
  TiposProdutoController.criar,
);
router.delete(
  "/tipos-produto/:id",
  PermissoesMiddleware.exigirPermissao("operational.types-products.access"),
  TiposProdutoController.remover,
);

export default router;
