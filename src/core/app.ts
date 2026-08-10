import dotenv from 'dotenv';
import express, { json, type Request, type Response } from 'express';
import { createServer, type Server as HttpServer } from 'http';
import cors from 'cors';
import { Server, type Server as SocketServer } from 'socket.io';
import router from './router.js';
import TratadorErroGlobal from './middlewares/tratador-erro-global.middleware.js';
import LogMiddleware from './middlewares/log.middleware.js';
import AuditoriaMiddleware from './middlewares/auditoria.middleware.js';
import ManipuladorResposta from './utils/manipulador-resposta.js';
import SegurancaMiddleware from './middlewares/seguranca.middleware.js';
import { env } from './config/env.js';

dotenv.config();

const app = express();
const server: HttpServer = createServer(app);

if (env.trustProxy !== false) {
  app.set('trust proxy', env.trustProxy);
}

const io: SocketServer = new Server(server, {
  cors: {
    origin: env.origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

app.disable('x-powered-by');
(app as any).io = io;

app.use(SegurancaMiddleware.handle);
app.use(json({ limit: '1mb' }));
app.use(cors({
  origin: env.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Authorization', 'Content-Type', 'Accept'],
}));

app.use(LogMiddleware.handle);
app.use(AuditoriaMiddleware.handle);
app.use(router);

app.use((req: Request, res: Response) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/docs') || req.path.startsWith('/saude')) {
    ManipuladorResposta.erro(res, 'Rota não encontrada', 404);
  } else {
    ManipuladorResposta.erro(res, 'Rota não encontrada', 404);
  }
});

app.use(TratadorErroGlobal.handle);

export { server, io, app };
export default app;
