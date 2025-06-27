import { Router } from 'express';
import * as emergenciaController from '../controllers/emergencia.controller.js';

const router = Router();

router.post('/emergencia', emergenciaController.ingresoEmergencia);

export default router;
