import { Router } from 'express';
import {
	getAdmisiones,
	getAdmisionById,
	createAdmision,
	updateAdmision,
	deleteAdmision,
	getOpcionesAdmision,
	validarAdmisionPorDNI,
	buscarAdmisionVigente,
	darAltaPaciente,
} from '../controllers/admision.controller.js';

const router = Router();


// Rutas específicas primero
router.get('/validar-dni/:dni', validarAdmisionPorDNI); // ✅ nueva validación
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
