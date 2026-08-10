import { Router, json } from 'express';
import { serve, setup } from 'swagger-ui-express';
import { generateOpenApiDocument } from './docs/openapi.js';

import AutenticacaoMiddleware from './middlewares/autenticacao.middleware.js';
import authRouter from './autenticacao/autenticacao.routes.js';
import logsRouter from './logs/logs.routes.js';
import permissionsRouter from './permissoes/permissoes.routes.js';
import profileRouter from '../modules/perfil/perfil.routes.js';
import usersRouter from '../modules/usuarios/usuarios.routes.js';
import tenantsRouter from '../modules/locatarios/locatarios.routes.js';
import estoqueRouter from '../modules/estoque/estoque.routes.js';
import vendasRouter from '../modules/vendas/vendas.routes.js';
import servicosRouter from '../modules/servicos/servicos.routes.js';
import ordensServicoRouter from '../modules/ordens-servico/ordens-servico.routes.js';
import statusServicoRouter from '../modules/status-servico/status-servico.routes.js';
import statusPagamentoRouter from '../modules/status-pagamento/status-pagamento.routes.js';
import tiposProdutoRouter from '../modules/tipos-produto/tipos-produto.routes.js';
import notificacoesRouter from '../modules/notificacoes/notificacoes.routes.js';
import pecasServicoRouter from '../modules/pecas-servico/pecas-servico.routes.js';
import clientesRouter from '../modules/clientes/clientes.routes.js';
import cargosRouter from '../modules/cargos/cargos.routes.js';
import fornecedoresRouter from '../modules/fornecedores/fornecedores.routes.js';
import agendaRouter from '../modules/agenda/agenda.routes.js';
import acessoExternoRouter from '../modules/acesso-externo/acesso-externo.routes.js';
import pontoRouter from '../modules/ponto/ponto.routes.js';
import limitarAcessoExterno from './middlewares/acesso-externo.middleware.js';

const router = Router();
const openApiDocument = generateOpenApiDocument();

router.use(json());

router.get('/saude', (_req, res) => res.status(200).json({ status: 'ok', service: 'opeflow-api' }));
router.use('/docs', serve);
router.get('/docs', setup(openApiDocument));

// Rotas públicas de autenticação local
router.use('/api/autenticacao', authRouter);

// Middleware global de autenticação JWT
router.use('/api', AutenticacaoMiddleware.autenticarToken);
router.use('/api', limitarAcessoExterno);

router.use('/api', profileRouter);
router.use('/api', usersRouter);
router.use('/api', tenantsRouter);
router.use('/api', permissionsRouter);
router.use('/api', logsRouter);
router.use('/api', estoqueRouter);
router.use('/api', vendasRouter);
router.use('/api', servicosRouter);
router.use('/api', ordensServicoRouter);
router.use('/api', statusServicoRouter);
router.use('/api', statusPagamentoRouter);
router.use('/api', tiposProdutoRouter);
router.use('/api', notificacoesRouter);
router.use('/api', pecasServicoRouter);
router.use('/api', clientesRouter);
router.use('/api', cargosRouter);
router.use('/api', fornecedoresRouter);
router.use('/api', agendaRouter);
router.use('/api', acessoExternoRouter);
router.use('/api', pontoRouter);

export default router;
