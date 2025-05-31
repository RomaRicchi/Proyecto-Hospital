import { Router } from 'express';
import {
	getMotivosIngreso,
	createMotivoIngreso,
	getMotivoIngresoById,
	updateMotivoIngreso,
	deleteMotivoIngreso
} from '../controllers/motivoIngreso.controller.js';

const router = Router();
router.get('/motivoIngreso', getMotivosIngreso);
router.post('/motivoIngreso', createMotivoIngreso);
router.get('/motivoIngreso/:id', getMotivoIngresoById);
router.put('/motivoIngreso/:id', updateMotivoIngreso);
router.delete('/motivoIngreso/:id', deleteMotivoIngreso);

export default router;