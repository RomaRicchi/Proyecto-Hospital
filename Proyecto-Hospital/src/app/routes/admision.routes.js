import { Router } from 'express';
import {
	getAdmisiones,
	getAdmisionById,
	createAdmision,
	updateAdmision,
	deleteAdmision,
	getOpcionesAdmision,
	validarAdmisionPorDNI,
	getInfoCama
} from '../controllers/admision.controller.js';

const router = Router();

router.get('/validar-dni/:dni', validarAdmisionPorDNI);
router.get('/opciones', getOpcionesAdmision);
router.get('/', getAdmisiones);
router.get('/:id', getAdmisionById);
router.get('/cama/:id', getInfoCama);
router.post('/', createAdmision);
router.put('/:id', updateAdmision);
router.delete('/:id', deleteAdmision);


export default router;
