import { Router } from 'express';
import * as emergenciaController from '../controllers/emergencia.controller.js';

const router = Router();

// POST /api/emergencias/emergencia
router.post('/emergencia', emergenciaController.ingresoEmergencia);

export default router;
