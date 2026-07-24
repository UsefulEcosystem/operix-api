import { Router } from 'express';
import LogsController from './logs.controller.js';

const router = Router();

router.get('/logs', LogsController.obterLogsPaginados);

export default router;
