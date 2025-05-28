import { Router } from 'express';
import {
	getMotivosIngreso,
	getMotivoIngresoById,
	createMotivoIngreso,
	updateMotivoIngreso,
	deleteMotivoIngreso,
} from '../controllers/motivoIngreso.controller.js';

const router = Router();

router.get('/', getMotivosIngreso);
router.get('/:id', getMotivoIngresoById);
router.post('/', createMotivoIngreso);
router.put('/:id', updateMotivoIngreso);
router.delete('/:id', deleteMotivoIngreso);

export default router;
