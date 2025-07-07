import { Router } from 'express';
import * as emergenciaController from '../controllers/emergencia.controller.js';

const router = Router();

router.post('/', emergenciaController.ingresoEmergencia);

export default router;
