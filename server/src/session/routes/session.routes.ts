// src/routes/session.routes.ts
import { Router } from 'express';

import { SessionController } from '../controllers/session.controller';
import { SessionRepository } from '../service/session.repository';
import { SessionService } from '../service/session.service';

const repo = new SessionRepository();
const service = new SessionService(repo);
const controller = new SessionController(service);

export const sessionRouter = Router();
sessionRouter.post('/', controller.createOrRestore);
