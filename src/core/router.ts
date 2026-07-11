import { Router, json } from 'express';
import { serve, setup } from 'swagger-ui-express';
import { generateOpenApiDocument } from './docs/openapi.js';

import AutenticacaoMiddleware from './middlewares/autenticacao.middleware.js';
import { operationalRouter } from '../modules/operacional/index.js';
import { inventoryRouter } from '../modules/inventario/index.js';
import { configuracoesRouter } from '../modules/configuracoes/index.ts';
import { profileRouter } from './perfil/index.js';
import { notificationsRouter } from '../modules/notificacoes/index.js';
import authRouter from './autenticacao/autenticacao.routes.js';
import logsRouter from './registros/registros.routes.js';

const router = Router();
const openApiDocument = generateOpenApiDocument();

router.use(json());

router.get('/saude', (_req, res) => res.status(200).json({ status: 'ok', service: 'operix-service-api' }));
router.use('/docs', serve);
router.get('/docs', setup(openApiDocument));

// Rotas públicas de autenticação local
router.use('/api/autenticacao', authRouter);

// Middleware global de autenticação JWT
router.use('/api', AutenticacaoMiddleware.autenticarToken);

// Rotas Modulares
router.use('/api', configuracoesRouter);
router.use('/api', operationalRouter);
router.use('/api', inventoryRouter);
router.use('/api', profileRouter);
router.use('/api', notificationsRouter);
router.use('/api', logsRouter);

export default router;
