import { Router } from 'express';
import {
    actualizarPacienteEmergencia,
    ingresoEmergencia
} from '../controllers/emergencia.controller.js';

const router = Router();

router.post('/', ingresoEmergencia);
router.post('/actualizar-emergencia', actualizarPacienteEmergencia);

export default router;
