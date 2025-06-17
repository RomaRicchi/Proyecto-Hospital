import { Router } from 'express';
import {
	getAdmisiones,
	getAdmisionById,
	createAdmision,
	updateAdmision,
	deleteAdmision,
	getOpcionesAdmision,
	validarAdmisionPorDNI,
} from '../controllers/admision.controller.js';
import { 
	verificarAdmisionActiva,
    buscarAdmisionVigente,
	darAltaPaciente, 
} from '../controllers/alta.controller.js';

const router = Router();

// Rutas específicas primero
router.get('/validar-dni/:dni', validarAdmisionPorDNI);
router.get('/verificar/:id_paciente', verificarAdmisionActiva);
router.get('/paciente/:dni/admisiones-vigentes', buscarAdmisionVigente);
router.post('/paciente/:dni/alta', darAltaPaciente);
router.get('/opciones', getOpcionesAdmision);
// Rutas CRUD generales
router.get('/', getAdmisiones);
router.get('/:id', getAdmisionById);
router.post('/', createAdmision);
router.put('/:id', updateAdmision);
router.delete('/:id', deleteAdmision);

export default router;
