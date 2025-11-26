import { Router } from 'express';
import { 
    buscarAdmisionVigente,
    darAltaPaciente,
} from '../controllers/alta.controller.js';

const router = Router();

router.get('/paciente/:dni/admisiones-vigentes', buscarAdmisionVigente);
router.post('/paciente/:dni/alta', darAltaPaciente);

export default router;

