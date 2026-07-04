import { io } from './app.js';
import MensageriaService from './utils/mensageria.service.js';
import AutenticacaoMiddleware from './middlewares/autenticacao.middleware.js';

MensageriaService.init(io);

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];
  if (!token) {
    return next(new Error('Autenticação WebSockets Necessária'));
  }

  const cleanToken = typeof token === 'string' && token.startsWith('Bearer ') ? token.split(' ')[1] : token;

  try {
    const user = await AutenticacaoMiddleware.verificarTokenBruto(cleanToken as string);
    (socket as any).user = user;
    next();
  } catch {
    return next(new Error('Token de Mensageria Inválido'));
  }
});

io.on('connection', (socket) => {
  const user = (socket as any).user;

  if (user && user.tenant_id) {
    socket.join(`tenant_${user.tenant_id}`);
  }

  socket.on('disconnect', () => { });
});
